const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const dbModule = require('./database.js');

let mainWindow;
let tray;
let guideWindow = null;
let scannerWindow = null;
let pdfWindow = null;
let settingsWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true
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
4        },
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
    { label: '显示/隐藏宠物', click: togglePetVisibility },
    { label: '扫码入库', click: () => openScanner() },
    { label: '生成实验记录', click: () => openGuide() },
    { label: '设置', click: () => openSettings() },
    { label: '查看输出文件', click: () => openOutputFolder() },
    { label: '退出', click: () => app.quit() }
  ]);
  
  tray.setToolTip('桌面宠物');
  tray.setContextMenu(contextMenu);
}

// 触发QR码扫描
function togglePetVisibility() {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  }
}

function openScanner() {
  if (scannerWindow) {
    scannerWindow.close();
  }
  scannerWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: '扫码入库',
    frame: true,
    resizable: false
  });
  scannerWindow.loadFile('scanner.html');
}

function openGuide() {
  if (guideWindow) {
    guideWindow.close();
  }
  guideWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: '实验记录向导',
    frame: true,
    resizable: false
  });
  guideWindow.loadFile('guide.html');
}

function openSettings() {
  if (settingsWindow) {
    settingsWindow.close();
  }
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: '设置',
    frame: true,
    resizable: false
  });
  settingsWindow.loadFile('settings.html');
  
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function openOutputFolder() {
  const outputPath = path.join(__dirname, 'output');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  require('electron').shell.openPath(outputPath);
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
  ipcMain.on('init-database', async (event) => {
    try {
      const result = await dbModule.initDatabase();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
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
  
  ipcMain.on('generate-eln', (event, data) => {
    console.log('生成实验记录:', data);
    const elnModule = require('./src/eln_generation.js');
    const result = elnModule.generateELN(data);
    
    // 打开PDF预览
    if (result.success && result.pdfPath) {
      require('electron').shell.openPath(result.pdfPath);
      
      // 触发宠物祝贺动画
      if (mainWindow) {
        mainWindow.webContents.send('congratulations-animation');
      }
    }
    
    event.returnValue = result;
  });
  
  ipcMain.on('open-pdf-preview', (event, pdfPath) => {
    require('electron').shell.openPath(pdfPath);
    event.returnValue = { success: true };
  });
  
  ipcMain.on('get-eln-template', (event) => {
    const templatePath = path.join(__dirname, 'templates', 'eln_template.json');
    try {
      const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
      event.returnValue = template;
    } catch (err) {
      event.returnValue = null;
    }
  });
  
  ipcMain.on('save-settings', (event, settings) => {
    try {
      const envPath = path.join(__dirname, '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      const lines = envContent ? envContent.split('\n') : [];
      
      for (const [key, value] of Object.entries(settings)) {
        const lineIndex = lines.findIndex(line => line.startsWith(key + '='));
        if (lineIndex !== -1) {
          lines[lineIndex] = `${key}=${value}`;
        } else {
          lines.push(`${key}=${value}`);
        }
      }
      
      fs.writeFileSync(envPath, lines.join('\n'), 'utf-8');
      
      // 设置全局环境变量使其立即生效
      for (const [key, value] of Object.entries(settings)) {
        process.env[key] = value;
      }
      
      console.log('设置已保存并生效:', settings);
      event.returnValue = { success: true };
    } catch (error) {
      console.error('保存设置失败:', error);
      event.returnValue = { success: false, error: error.message };
    }
  });
  
  ipcMain.on('load-settings', (event) => {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      event.returnValue = {};
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const settings = {};
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          settings[key.trim()] = value.trim();
        }
      }
    });
    
    event.returnValue = settings;
  });

  ipcMain.on('insert-from-qrcode', async (event, qrData) => {
    try {
      const result = await dbModule.insertFromQRCode(qrData);
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
  });

  ipcMain.on('get-empty-location-records', async (event) => {
    try {
      const result = await dbModule.getEmptyLocationRecords();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message, count: 0, data: [] };
    }
  });

  ipcMain.on('update-storage-location', async (event, goodsId, location) => {
    try {
      const result = await dbModule.updateStorageLocation(goodsId, location);
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
  });

  ipcMain.on('simulate-qrscan', async (event) => {
    try {
      const qrcodes = [
        '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
        '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
        '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C',
        '商品名称：显示器 数量：20 价格：999.99 供应商：供应商D'
      ];
      const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
      const result = await dbModule.insertFromQRCode(randomQR);
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
      const result = await dbModule.queryInventoryData();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message, data: [] };
    }
  });

  ipcMain.on('query-goods-in', async (event) => {
    try {
      const result = await dbModule.queryGoodsInData();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message, data: [] };
    }
  });

  ipcMain.on('clear-database', async (event) => {
    try {
      const result = await dbModule.clearDatabase();
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { success: false, error: error.message };
    }
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

  // index.html 气泡按钮 IPC 处理
  ipcMain.on('triggerQRScan', () => {
    openScanner();
  });

  ipcMain.on('openGuide', () => {
    openGuide();
  });

  ipcMain.on('openOutputFolder', () => {
    openOutputFolder();
  });
}

// 启动提醒定时器
function startTimer() {
  // 检查是否已创建.env文件
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      const examplePath = path.join(__dirname, '.env.example');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log('已创建.env文件，请配置相关参数');
      }
    }
  } catch (err) {
    console.log('检查.env文件失败:', err.message);
  }

  // 每5分钟检查一次空位置记录
  setInterval(async () => {
    try {
      const records = await dbModule.getEmptyLocationRecords();
      
      if (records.success && records.count > 0) {
        console.log(`发现 ${records.count} 个商品未录入位置`);
        
        // 触发桌宠动画
        if (mainWindow) {
          mainWindow.webContents.send('trigger-animation', records.data);
        }
      }
    } catch (error) {
      console.error('检查空位置记录失败:', error);
    }
  }, 5 * 60 * 1000);
}

app.whenReady().then(() => {
  setupIPC();
  createWindow();
  createTray();
  startTimer();
  
  // 窗口管理
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
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
