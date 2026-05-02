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

async function simulateQRScan() {
  const qrcodes = [
    '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
    '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
    '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C'
  ];
  
  const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
  
  try {
    const result = await Database.insertFromQRCode(randomQR);
    console.log('QR码扫描入库:', result);
    
    if (mainWindow && result) {
      mainWindow.webContents.send('show-message', `扫描成功：${result.goods_name || '未知'}`);
    }
  } catch (error) {
    console.error('QR码扫描入库失败:', error);
  }
}

async function checkEmptyLocations() {
  try {
    const records = await Database.getEmptyLocationRecords();
    
    if (records.success && records.count > 0) {
      const message = records.data.map(r => `${r.goods_name} (${r.quantity})`).join(', ');
      console.log('发现空位置商品:', message);
      triggerPetAnimation(records.data);
    }
  } catch (error) {
    console.error('检查空位置失败:', error);
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
  ipcMain.on('init-database', async (event) => {
    try {
      const result = await Database.initDatabase();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
  });

  ipcMain.on('insert-from-qrcode', async (event, qrData) => {
    try {
      const result = await Database.insertFromQRCode(qrData);
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
  });

  ipcMain.on('get-empty-location-records', async (event) => {
    try {
      const result = await Database.getEmptyLocationRecords();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message, count: 0, data: [] };
    }
  });

  ipcMain.on('update-storage-location', async (event, goodsId, location) => {
    try {
      const result = await Database.updateStorageLocation(goodsId, location);
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
  });

  ipcMain.on('simulate-qrscan', async (event) => {
    try {
      const result = await simulateQRScan();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
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

  ipcMain.on('query-inventory', async (event) => {
    try {
      const result = await Database.queryInventoryData();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message, data: [] };
    }
  });

  ipcMain.on('query-goods-in', async (event) => {
    try {
      const result = await Database.queryGoodsInData();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message, data: [] };
    }
  });

  ipcMain.on('clear-database', async (event) => {
    try {
      const result = await Database.clearDatabase();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
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