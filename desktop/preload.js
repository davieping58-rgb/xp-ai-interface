const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('xpDesktop',{
  toggleFullscreen:()=>ipcRenderer.invoke('xp:fullscreen'),
  telemetry:()=>ipcRenderer.invoke('xp:telemetry'),
  coreHealth:()=>ipcRenderer.invoke('xp:core-health'),
  chat:(message)=>ipcRenderer.invoke('xp:chat',message),
  openUrl:(url)=>ipcRenderer.invoke('xp:open-url',url),
  chooseImage:()=>ipcRenderer.invoke('xp:choose-image'),
  openFile:(path)=>ipcRenderer.invoke('xp:open-file',path)
});