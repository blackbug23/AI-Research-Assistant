const { app, BrowserWindow } = require('electron');
const Database = require('./simple_db.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    movable: true,
    resizable: false
  });

  mainWindow.loadFile('simple_index.html');
  mainWindow.setMenu(null);

  // 暴露数据库API到window对象
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      window.simpleApi = {
        insertQR: function(qrData) {
          const result = require('electron').ipcRenderer.sendSync('insert-from-qrcode', qrData);
          return result;
        },
        checkEmpty: function() {
          const result = require('electron').ipcRenderer.sendSync('get-empty-location-records');
          return result;
        },
        updateLocation: function(goodsId, location) {
          const result = require('electron').ipcRenderer.sendSync('update-storage-location', goodsId, location);
          return result;
        },
        queryData: function() {
          const result = require('electron').ipcRenderer.sendSync('query-goods-in');
          return result;
        },
        queryInventory: function() {
          const result = require('electron').ipcRenderer.sendSync('query-inventory');
          return result;
        },
        clearData: function() {
          const result = require('electron').ipcRenderer.sendSync('clear-database');
          return result;
        },
        simulateScan: function() {
          const qrcodes = [
            '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
            '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
            '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C'
          ];
          const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
          return window.simpleApi.insertQR(randomQR);
        },
        simulateVoice: function() {
          const locations = [
            '仓库A-货架1',
            '仓库B-货架3',
            '仓库C-货架5',
            '仓库D-货架7'
          ];
          return locations[Math.floor(Math.random() * locations.length)];
        }
      };
    `);
  });

  // 定时检查空位置
  setTimeout(() => {
    const emptyRecords = Database.getEmptyLocationRecords();
    if (emptyRecords.success && emptyRecords.count > 0) {
      mainWindow.webContents.send('pet-reminder', emptyRecords.data);
    }
  }, 10000); // 10秒后检查

  // 每5分钟检查一次
  const reminderTimer = setInterval(() => {
    const emptyRecords = Database.getEmptyLocationRecords();
    if (emptyRecords.success && emptyRecords.count > 0) {
      mainWindow.webContents.send('pet-reminder', emptyRecords.data);
    }
  }, 5 * 60 * 1000); // 5分钟

  mainWindow.on('closed', () => {
    clearInterval(reminderTimer);
    mainWindow = null;
  });
}

// IPC消息处理
const { ipcMain } = require('electron');
ipcMain.on('insert-from-qrcode', (event, qrData) => {
  const result = Database.insertFromQRCode(qrData);
  event.returnValue = result;
});

ipcMain.on('get-empty-location-records', (event) => {
  const result = Database.getEmptyLocationRecords();
  event.returnValue = result;
});

ipcMain.on('update-storage-location', (event, goodsId, location) => {
  const result = Database.updateStorageLocation(goodsId, location);
  event.returnValue = result;
});

ipcMain.on('query-goods-in', (event) => {
  const result = Database.queryGoodsInData();
  event.returnValue = result;
});

ipcMain.on('query-inventory', (event) => {
  const result = Database.queryInventoryData();
  event.returnValue = result;
});

ipcMain.on('clear-database', (event) => {
  const result = Database.clearDatabase();
  event.returnValue = result;
});

app.whenReady().then(() => {
  // 初始化数据库
  Database.loadData();
  
  // 创建窗口
  createWindow();
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