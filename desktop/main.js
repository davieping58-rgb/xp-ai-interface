const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execFile } = require('child_process');
const http = require('http');
const https = require('https');

const CORE_URL = process.env.XP_CORE_URL || 'http://127.0.0.1:8765';
let startedAt = Date.now();

function ps(script){
  return new Promise(resolve=>execFile('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-Command',script],{windowsHide:true,timeout:5000},(err,stdout)=>resolve(err?'':String(stdout||'').trim())));
}
function requestJson(url, options={}){
  return new Promise((resolve,reject)=>{
    const u=new URL(url); const lib=u.protocol==='https:'?https:http;
    const req=lib.request(u,{method:options.method||'GET',headers:{'Content-Type':'application/json',...(options.headers||{})},timeout:15000},res=>{
      let data=''; res.on('data',d=>data+=d); res.on('end',()=>{
        if(res.statusCode<200||res.statusCode>=300) return reject(new Error(`HTTP ${res.statusCode}`));
        try{resolve(data?JSON.parse(data):{});}catch{resolve({text:data});}
      });
    });
    req.on('timeout',()=>req.destroy(new Error('timeout'))); req.on('error',reject);
    if(options.body) req.write(JSON.stringify(options.body)); req.end();
  });
}
async function coreHealth(){
  for(const p of ['/health','/','/status']){try{await requestJson(CORE_URL+p);return {online:true,url:CORE_URL};}catch{}}
  return {online:false,url:CORE_URL};
}
async function sendCore(message){
  const attempts=[
    ['/chat',{message}],['/chat',{text:message}],['/message',{message}],['/ask',{message}],['/handoff',{message}],['/',{message}]
  ];
  let last='XP Core did not accept a known chat endpoint.';
  for(const [p,body] of attempts){try{
    const r=await requestJson(CORE_URL+p,{method:'POST',body});
    return {ok:true,reply:r.reply||r.response||r.answer||r.message||r.text||JSON.stringify(r)};
  }catch(e){last=e.message;}}
  return {ok:false,reply:last};
}
async function telemetry(){
  const total=os.totalmem(), free=os.freemem();
  const cpu=await ps("(Get-Counter '\\Processor(_Total)\\% Processor Time').CounterSamples.CookedValue");
  const disk=await ps("$d=Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\"; if($d.Size){[math]::Round((1-$d.FreeSpace/$d.Size)*100,0)}");
  const processes=await ps("Get-Process | Sort-Object CPU -Descending | Select-Object -First 7 | ForEach-Object { $_.ProcessName + '  ' + [math]::Round($_.CPU,1) }");
  const h=await coreHealth();
  return {cpu:cpu?Math.round(parseFloat(cpu)):0,ram:Math.round((1-free/total)*100),disk:disk||'--',uptime:Math.floor(os.uptime()),processes:processes.split(/\r?\n/).filter(Boolean),core:h};
}
function createWindow(){
  const win=new BrowserWindow({width:1600,height:900,minWidth:1000,minHeight:650,backgroundColor:'#000000',autoHideMenuBar:true,title:'XP AI Systems',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});
  win.loadFile(path.join(__dirname,'index.html'));
}
ipcMain.handle('xp:fullscreen',(event)=>{const win=BrowserWindow.fromWebContents(event.sender);win.setFullScreen(!win.isFullScreen());return win.isFullScreen();});
ipcMain.handle('xp:telemetry',()=>telemetry());
ipcMain.handle('xp:core-health',()=>coreHealth());
ipcMain.handle('xp:chat',(_e,message)=>sendCore(String(message||'').trim()));
ipcMain.handle('xp:open-url',(_e,url)=>shell.openExternal(String(url)));
ipcMain.handle('xp:open-file',(_e,filePath)=>shell.openPath(String(filePath)));
ipcMain.handle('xp:choose-image',async(event)=>{const {dialog}=require('electron');const win=BrowserWindow.fromWebContents(event.sender);const r=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Images',extensions:['png','jpg','jpeg','webp','gif']}]});return r.canceled?null:r.filePaths[0];});
app.whenReady().then(createWindow);app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});