const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  validateScreen: (screenId) => ipcRenderer.invoke('validate-screen', screenId),
  fetchContent: (screenId) => ipcRenderer.invoke('fetch-content', screenId)
});