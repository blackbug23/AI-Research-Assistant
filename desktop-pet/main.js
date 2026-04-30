const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const dbModule = require('./database.js');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
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
        insertFromQRCode: (qrData) => {
          const result = require('electron').ipcRenderer.sendSync('insert-from-qrcode', qrData);
          return result;
        },
        getEmptyLocationRecords: () => {
          const result = require('electron').ipcRenderer.sendSync('get-empty-location-records');
          return result;
        },
        updateStorageLocation: (goodsId, location) => {
          const result = require('electron').ipcRenderer.sendSync('update-storage-location', goodsId, location);
          return result;
        },
        simulateQRScan: () => {
          const result = require('electron').ipcRenderer.sendSync('simulate-qrscan');
          return result;
        },
        getVoiceLocationInput: () => {
          const result = require('electron').ipcRenderer.sendSync('get-voice-location-input');
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
        },
        startReminderTimer: () => {
          const result = require('electron').ipcRenderer.sendSync('start-reminder-timer');
          return result;
        },
        triggerPetAnimation: (goodsList) => {
          // 触发桌宠动画
          const result = require('electron').ipcRenderer.sendSync('trigger-pet-animation', goodsList);
          return result;
        },
        showReminderDialog: (message) => {
          // 显示提醒对话框
          const result = require('electron').ipcRenderer.sendSync('show-reminder-dialog', message);
          return result;
        }
      };
    `);
  });

  mainWindow.on('closed', () => {
    mainFriends = null;
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
    { label: '扫描QR码', click: () => triggerQRScan() },
    { label: '查看空位置商品', click: () => showEmptyLocationRecords() },
    { label: '测试语音录入', click: () => testVoiceInput() },
    { label: '打开面板', click: () => mainWindow.show() },
    { label: '隐藏', click: () => mainWindow.hide() },
    { label: '退出', click: () => app.quit() }
  ]);
  
  tray.setToolTip('桌面宠物');
  tray.setContextMenu(contextMenu);
}

// 触发QR码扫描
function triggerQRScan() {
  if (mainWindow) {
    mainWindow.webContents.send('scan-qrcode');
  }
}

// 查看空位置商品
function showEmptyLocationRecords() {
  const records = dbModule.getEmptyLocationRecords();
  if (records.success && records.count > 0) {
    const message = '有 ' + records.count + ' 个商品没有录入位置';
    if (mainWindow) {
      mainWindow.webContents.send('show-reminder', message);
    }
  }
}

// 测试语音录入
function testVoiceInput() {
  const location = dbModule.getVoiceLocationInput();
  console.log('模拟语音输入位置:', location);
}

// IPC消息处理
function setupIPC() {
  ipcMain.on('init-database', (event) => {
    const result = dbModule.initDatabase();
    event.returnValue = result;
  });

  ipcMain.on('insert-from-qrcode', (event, qrData) => {
    const result = dbModule.insertFromQRCode(qrData);
    event.returnValue = result;
  });

  ipcMain.on('get-empty-location-records', (event) => {
    const result = dbModule.getEmptyLocationRecords();
    event.returnValue = result;
  });

  ipcMain.on('update-storage-location', (event, goodsId, location) => {
    const result = dbModule.updateStorageLocation(goodsId, location);
    event.returnValue = result;
  });

  ipcMain.on('simulate-qrscan', (event) => {
    const qrcodes = [
      '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
      '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
      '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C',
      '商品名称：显示器 数量：20 价格：999.99 供应商：供应商D'
    ];
    const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
    const result = dbModule.insertFromQRCode(randomQR);
    event.returnValue = result;
  });

  ipcMain.on('get-voice-location-input', (event) => {
    const locations = [
      '仓库A-货架1',
      '仓库B-货架3',
      '仓库C-货架5',
      '仓库D-货架7'
    ];
    const location = locations[Math.floor(Math.random() * locations.length)];
    event.returnValue = { location };
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

  ipcMain.on('start-reminder-timer', (event) => {
    const result = dbModule.startReminderTimer();
    event.returnValue = result;
  });

  ipcMain.on('trigger-pet-animation', (event, goodsList) => {
    const message = goodsList.map(g => `${g.goods_name} (${g.quantity})`).join(', ');
    console.log('触发桌宠动画和气泡提醒:', message);
    
    // 触发UI动画
    if (mainWindow) {
      mainWindow.webContents.send('trigger-animation', goodsList);
    }
    
    event.returnValue = { success: true, message };
  });

  ipcMain.on('show-reminder-dialog', (event, message) => {
    console.log('显示提醒对话框:', message);
    
    if (mainWindow) {
      mainWindow.webContents.send('show-dialog', message);
    }
    
    event.returnValue = { success: true };
  });
}

// 启动提醒定时器
function startTimer() {
  // 每5分钟检查一次空位置记录
  setInterval(() => {
    const records = dbModule.getEmptyLocationRecords();
    
    if (records.success && records.count > 0) {
      console.log(`发现 ${records.count} 个商品未录入位置`);
      
      // 触发桌宠动画
      if (mainWindow) {
        mainWindow.webContents.send('trigger-animation', records.data);
      }
    }
  }, 5 * 60 * 1000);
}

app.whenReady().then(() => {
  setupIPC();
  createWindow();
  createTray();
  startTimer();
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