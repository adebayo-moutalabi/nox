const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nox', {
  ask: (text) => ipcRenderer.invoke('nox:ask', text),
  speak: (text) => ipcRenderer.invoke('nox:speak', text),
  transcribe: (buf) => ipcRenderer.invoke('nox:transcribe', buf),
  getState: () => ipcRenderer.invoke('nox:getState'),
  setSettings: (s) => ipcRenderer.invoke('nox:setSettings', s),
  resetTask: () => ipcRenderer.invoke('nox:resetTask'),
  greet: () => ipcRenderer.invoke('nox:greet'),
  realtimeToken: () => ipcRenderer.invoke('nox:realtimeToken'),
  realtimeInstructions: () => ipcRenderer.invoke('nox:realtimeInstructions'),
  tool: (name, args, userText) => ipcRenderer.invoke('nox:tool', name, args, userText),
  setRealtimeActive: (on) => ipcRenderer.send('nox:realtimeActive', on),
  remember: (role, text) => ipcRenderer.send('nox:remember', role, text),
  onEvent: (cb) => ipcRenderer.on('nox:event', (_e, d) => cb(d)),
  cursor: () => ipcRenderer.invoke('nox:cursor'),
  moveTo: (x, y) => ipcRenderer.send('nox:moveTo', x, y),
  quit: () => ipcRenderer.send('nox:quit'),
  onProactive: (cb) => ipcRenderer.on('nox:proactive', (_e, d) => cb(d)),
  onMood: (cb) => ipcRenderer.on('nox:mood', (_e, d) => cb(d)),
  onError: (cb) => ipcRenderer.on('nox:error', (_e, d) => cb(d))
});
