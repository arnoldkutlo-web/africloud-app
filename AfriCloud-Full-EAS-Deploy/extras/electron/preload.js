
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  startSync: (config) => ipcRenderer.invoke('start-sync', config)
});
