const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadMedia: (data) => ipcRenderer.invoke('download-media', data),
  onProgress: (callback) => ipcRenderer.on('download-progress', (_event, value) => callback(value))
});
