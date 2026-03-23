const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    savePhoto: (dataUrl) => ipcRenderer.invoke('save-photo', dataUrl),
    printPhoto: (filePath) => ipcRenderer.invoke('print-photo', filePath)
});
