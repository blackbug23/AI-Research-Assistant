const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const dbModule = require('./preload');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true
  });

  // 加载应用界面
  mainWindow.loadFile('index.html');
  
  // 隐藏默认的Electron菜单
  mainWindow.setMenu(null);

  // 暴露数据库API到window对象
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      window.api = {
        initDatabase: () => {
          const result = require('electron').ipcRenderer.sendSync('init-database');
          return result;
        },
        insertGoodsData: () => {
          const result = require('electron').ipcRenderer.sendSync('insert-data');
          return result;
        },
        queryInventoryData: () => {
          const result = require('electron').ipcRenderer.sendSync('query-inventory');
          return result;
        },
        queryGoodsInData: () => {
          const result = require('electron').ipcRenderer.sendSync('query-goods-in');
          return result;
        },
        clearDatabase: () => {
          const result = require('electron').ipcRenderer.sendSync('clear-database');
          return result;
        }
      };
    `);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  let icon;
  
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch {
    // 如果没有图标，创建一个简单的16x16图标
    icon = nativeImage.createFromBuffer(Buffer.from([
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff
    ].repeat(16), 16));
  }

  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '打开面板', click: () => mainWindow.show() },
    { label: '隐藏', click: () => mainWindow.hide() },
    { label: '退出', click: () => app.quit() }
  ]);
  
  tray.setToolTip('桌面宠物');
  tray.setContextMenu(contextMenu);
}

// IPC消息处理
function setupIPC() {
  ipcMain.on('init-database', (event) => {
    const result = dbModule.initDatabase();
    event.returnValue = result;
  });

  ipcMain.on('insert-data', (event) => {
    const result = dbModule.insertGoodsData();
    event.returnValue = result;
  });

  ipcMain.on('query-inventory', (event) => {
    const result = dbModule.queryInventoryData();
    event.returnValue = result;
  });

  ipcMain.on('query-goods-in', (event) => {
    const result = dbModule.queryGoodsInData();
    event.returnValue = result;
  });

  ipcMain.on('clear-database', (event) => {
    const result = dbModule.clearDatabase();
    event.returnValue = result;
  });
}

app.whenReady().then(() => {
  setupIPC();
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});