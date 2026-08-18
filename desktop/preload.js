const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('xpDesktop', { toggleFullscreen: () => ipcRenderer.invoke('xp:fullscreen') });
