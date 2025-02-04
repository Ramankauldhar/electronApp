const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

let mainWindow, tray;
const API_BASE_URL = 'http://localhost:5000'; 
const localContentPath = path.join(app.getPath('userData'), 'local-content.json');

// Created the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

}

// Creates a system tray icon with a context menu
function createTray() {
  tray = new Tray(path.join(__dirname,'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Digital Signage');
  tray.setContextMenu(contextMenu);
}

// Save content data locally for offline playback
function saveToLocal(content) {
  fs.writeFileSync(localContentPath, JSON.stringify(content, null, 2));
}

// Read content from local storage
function loadFromLocal() {
  if (fs.existsSync(localContentPath)) {
    return JSON.parse(fs.readFileSync(localContentPath));
  }
  return [];
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

// IPC Handlers for Renderer Process
ipcMain.handle('validate-screen', async (_, screenId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/check-screen/${screenId}`);
    return response.data.registered;
  } catch (error) {
    console.error('Screen validation error:', error.message);
    return false;
  }
});

ipcMain.handle('fetch-content', async (_, screenId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/content/${screenId}`);
    // Save the fetched content locally
    saveToLocal(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching content, loading local data.', error.message);
    return loadFromLocal();
  }
});

// Close the application gracefully
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
