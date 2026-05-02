const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database.js');

let mainWindow;
let tray;

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

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);

  // 定时检查空位置商品
  setTimeout(() => {
    const emptyRecords = Database.getEmptyLocationRecords();
    if (emptyRecords.success && emptyRecords.count > 0) {
      // 触发桌宠动画和气泡提醒
      triggerPetAnimation(emptyRecords.data);
    }
  }, 10000); // 10秒后检查

  // 每5分钟检查一次
  setInterval(() => {
    const emptyRecords = Database.getEmptyLocationRecords();
    if (emptyRecords.success && emptyRecords.count > 0) {
      triggerPetAnimation(emptyRecords.data);
    }
  }, 5 * 60 * 1000); // 5分钟

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
    icon = nativeImage.createFromBuffer(Buffer.from([
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff
    ].repeat(16), 16));
  }

  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '测试扫描QR码', click: () => simulateQRScan() },
    { label: '检查空位置', click: () => checkEmptyLocations() },
    { label: '语音录入测试', click: () => testVoiceInput() },
    { label: '打开面板', click: () => mainWindow.show() },
    { label: '隐藏', click: () => mainWindow.hide() },
    { label: '退出', click: () => app.quit() }
  ]);
  
  tray.setToolTip('桌面宠物');
  tray.setContextMenu(contextMenu);
}

function simulateQRScan() {
  const qrcodes = [
    '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
    '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
    '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C'
  ];
  
  const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
  
  const result = Database.insertFromQRCode(randomQR);
  console.log('QR码扫描入库:', result);
  
  if (mainWindow) {
    mainWindow.webContents.send('show-message', `扫描成功：${result.goods_name}`);
  }
}

function checkEmptyLocations() {
  const records = Database.getEmptyLocationRecords();
  
  if (records.success && records.count > 0) {
    const message = records.data.map(r => `${r.goods_name} (${r.quantity})`).join(', ');
    console.log('发现空位置商品:', message);
    
    triggerPetAnimation(records.data);
  }
}

function triggerPetAnimation(goodsList) {
  const message = goodsList.map(g => `${g.goods_name} (${g.quantity})`).join(', ');
  
  if (mainWindow) {
    mainWindow.webContents.send('trigger-animation', goodsList);
    mainWindow.webContents.send('show-reminder', `新到的 ${message} 还没放好~`);
  }
}

function testVoiceInput() {
  const locations = [
    '仓库A-货架1',
    '仓库B-货架3',
    '仓库C-货架5',
    '仓库D-货架7'
  ];
  
  const location = locations[Math.floor(Math.random() * locations.length)];
  console.log('语音录入位置:', location);
  
  if (mainWindow) {
    mainWindow.webContents.send('show-voice-result', location);
  }
}

// IPC消息处理
function setupIPC() {
  ipcMain.on('init-database', (event) => {
    const result = Database.initDatabase();
    event.returnValue = result;
  });

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

  ipcMain.on('simulate-qrscan', (event) => {
    const result = simulateQRScan();
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
    const result = Database.queryInventoryData();
    event.returnValue = result;
  });

  ipcMain.on('query-goods-in', (event) => {
    const result = Database.queryGoodsInData();
    event.returnValue = result;
  });

  ipcMain.on('clear-database', (event) => {
    const result = Database.clearDatabase();
    event.returnValue = result;
  });
}

app.whenReady().then(() => {
  // 初始化数据库
  Database.initDatabase();
  
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