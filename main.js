const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, net } = require('electron');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

let mainWindow;
let tray;
let ws;
let autoSyncEnabled = true;
const localStoragePath = path.join(app.getPath('userData'), 'content.json');
const websocketURL = 'ws://localhost:5000';

// Created a Main Window
const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      webPreferences: {
          nodeIntegration: false,  // false for security
          contextIsolation: true,  // Required for contextBridge
          enableRemoteModule: false, 
          preload: path.join(__dirname, 'preload.js')  // Load the preload script fisrt
      }
    });
    mainWindow.loadURL('http://localhost:3000');
};

// Check Network Connectivity 
const isOnline = () => net.isOnline();

// Connect WebSocket
const connectWebSocket = () => {
    if (!isOnline()) {
        console.log('No internet connection, using offline mode');
        return;
    }
    
    ws = new WebSocket(websocketURL);

    ws.on('open', () => {
        console.log('WebSocket Connected');
        mainWindow.webContents.send('connection-status', 'online');
        if (autoSyncEnabled) sendLocalContent();
    });

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            if (isValidContent(parsedMessage)) {
                saveToLocal(parsedMessage);
                mainWindow.webContents.send('content-update', parsedMessage);
            }
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
        }
    });

    ws.on('close', () => {
        console.log(' WebSocket Disconnected, switching to offline mode');
        mainWindow.webContents.send('connection-status', 'offline');
    });
};

// Validate Content
const isValidContent = (data) => data && typeof data === 'object' && (data.text || data.images);

// Save Content Locally
const saveToLocal = (content) => {
    fs.writeFileSync(localStoragePath, JSON.stringify(content, null, 2));
};

// Load Local Content for Offline Mode
const loadFromLocal = () => {
    if (fs.existsSync(localStoragePath)) {
        return JSON.parse(fs.readFileSync(localStoragePath, 'utf-8'));
    }
    return null;
};

// Send Local Content data When Online
const sendLocalContent = () => {
    if (fs.existsSync(localStoragePath)) {
        const localContent = fs.readFileSync(localStoragePath, 'utf-8');
        ws.send(localContent);
        console.log('Sent Local Content');
    }
};

// IPC Event for Renderer to Get Offline Content
ipcMain.handle('get-offline-content', () => loadFromLocal());

// Show Notifications
const showNotification = (message) => {
    new Notification({ title: 'Digital Signage', body: message }).show();
};

// Create System Tray
const createTray = () => {
    tray = new Tray(path.join('icon.png'));
    console.log('Tray Icon Path:', path.join(__dirname, 'icon.png'));
    updateTrayMenu();
};

// Update System Tray Menu
const updateTrayMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
        { label: autoSyncEnabled ? 'Disable Auto-Sync' : 'Enable Auto-Sync', click: toggleAutoSync },
        { label: 'Reconnect WebSocket', click: connectWebSocket },
        { label: 'Quit', click: () => app.quit() },
    ]);
    tray.setContextMenu(contextMenu);
};

// Toggle Auto-Sync
const toggleAutoSync = () => {
    autoSyncEnabled = !autoSyncEnabled;
    showNotification(autoSyncEnabled ? ' Auto-Sync Enabled' : ' Auto-Sync Disabled');
    updateTrayMenu();
};

// App Ready Event
app.whenReady().then(() => {
    createWindow();
    createTray();
    connectWebSocket();
});

// Quit App on Close
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
