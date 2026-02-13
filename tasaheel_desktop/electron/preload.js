const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  dbInit: () => ipcRenderer.invoke('db:init'),
  dbGetEmployees: () => ipcRenderer.invoke('db:getEmployees'),
  dbCreateEmployee: (data) => ipcRenderer.invoke('db:createEmployee', data),
  dbUpdateEmployee: (id, data) => ipcRenderer.invoke('db:updateEmployee', id, data),
  dbGetSyncStatus: () => ipcRenderer.invoke('db:getSyncStatus'),

  // Sync
  syncPush: () => ipcRenderer.invoke('sync:push'),
  syncPull: () => ipcRenderer.invoke('sync:pull'),
  syncIsOnline: () => ipcRenderer.invoke('sync:isOnline'),

  // Auth
  authSetToken: (token) => ipcRenderer.invoke('auth:setToken', token),
  authGetToken: () => ipcRenderer.invoke('auth:getToken'),
})
