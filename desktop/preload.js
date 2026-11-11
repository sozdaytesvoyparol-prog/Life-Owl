'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lifeOwlApi', {
  /* окно */
  minimize: () => ipcRenderer.invoke('win:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('win:toggleMaximize'),
  close: () => ipcRenderer.invoke('win:close'),
  toggleFullscreen: () => ipcRenderer.invoke('win:fullscreen'),
  onMaximizeChange: (cb) => ipcRenderer.on('win:state', (_e, v) => cb(v)),
  isMaximized: () => ipcRenderer.invoke('win:isMax'),
  setZoom: (f) => ipcRenderer.invoke('win:zoom', f),

  /* авторизация */
  lastUser: () => ipcRenderer.invoke('auth:last'),
  register: (username, password) => ipcRenderer.invoke('auth:register', username, password),
  login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
  logout: () => ipcRenderer.invoke('auth:logout'),

  /* данные */
  saveState: (state) => ipcRenderer.invoke('state:save', state),
  saveStateSync: (state) => ipcRenderer.sendSync('state:saveSync', state)
});
