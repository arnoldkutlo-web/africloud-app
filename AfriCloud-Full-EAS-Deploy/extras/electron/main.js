
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000, height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile('index.html');
};
app.whenReady().then(createWindow);
app.on('window-all-closed', ()=> { if(process.platform !== 'darwin') app.quit(); });


// Append to main.js for IPC handling (simple)
const { ipcMain } = require('electron');
const { startSync } = require('./sync_worker');
const path = require('path');
ipcMain.handle('start-sync', async (event, config) => { 
  // config expected: {dir, apiUrl, token}
  const cfg = JSON.parse(config);
  process.env.API_URL = cfg.apiUrl || process.env.API_URL || 'http://localhost:4000/api';
  process.env.API_TOKEN = cfg.token || process.env.API_TOKEN || null;

  return startSync(config);
});
