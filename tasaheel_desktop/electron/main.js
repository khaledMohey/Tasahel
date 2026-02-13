const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Database = require('./database')
const SyncEngine = require('./sync')

let mainWindow
let db
let syncEngine

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../build/icon.png'),
    show: false, // Don't show until ready
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    // Load directly from Vite dev server (wait-on ensures it's ready)
    const url = 'http://localhost:5173'
    console.log(`Loading: ${url}`)
    
    mainWindow.loadURL(url).then(() => {
      console.log(`Successfully loaded: ${url}`)
      mainWindow.show()
      mainWindow.webContents.openDevTools()
    }).catch((err) => {
      console.error(`Failed to load ${url}:`, err.message)
      mainWindow.show()
      mainWindow.loadURL('data:text/html,<h1>Error loading Vite server</h1><p>Please check if Vite is running on port 5173</p>')
    })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    mainWindow.show()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    // Initialize database
    db = new Database()
    await db.init()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    // Continue anyway - database might not be critical for UI
  }
  
  try {
    // Initialize sync engine
    syncEngine = new SyncEngine(db)
    console.log('Sync engine initialized')
    
    // Start sync interval (every 2 minutes)
    setInterval(async () => {
      try {
        const isOnline = await syncEngine.checkOnline()
        if (isOnline) {
          syncEngine.sync()
        }
      } catch (error) {
        console.error('Sync error:', error)
      }
    }, 120000) // 2 minutes
  } catch (error) {
    console.error('Sync engine initialization error:', error)
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  if (db) {
    await db.close()
  }
})

// IPC Handlers
ipcMain.handle('db:init', async () => {
  try {
    await db.init()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:getEmployees', async () => {
  try {
    return await db.getEmployees()
  } catch (error) {
    console.error('Error getting employees:', error)
    return []
  }
})

ipcMain.handle('db:createEmployee', async (event, employeeData) => {
  try {
    return await db.createEmployee(employeeData)
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:updateEmployee', async (event, id, employeeData) => {
  try {
    return await db.updateEmployee(id, employeeData)
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:getSyncStatus', async () => {
  try {
    return await db.getSyncStatus()
  } catch (error) {
    return null
  }
})

ipcMain.handle('sync:push', async () => {
  return await syncEngine.push()
})

ipcMain.handle('sync:pull', async () => {
  return await syncEngine.pull()
})

ipcMain.handle('sync:isOnline', async () => {
  return await syncEngine.checkOnline()
})

ipcMain.handle('auth:setToken', (event, token) => {
  return syncEngine.setAuthToken(token)
})

ipcMain.handle('auth:getToken', () => {
  return syncEngine.getAuthToken()
})
