const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadMp3: (url) => ipcRenderer.invoke('download-mp3', url),
  onProgress: (callback) => ipcRenderer.on('download-progress', (_event, value) => callback(value))
});
