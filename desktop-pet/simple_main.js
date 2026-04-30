const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;

// 简单的数据库模拟
const mockDatabase = {
  goods_in: [],
  inventory: [],
  
  initDatabase() {
    console.log('初始化模拟数据库');
    return { success: true, message: '模拟数据库初始化成功' };
  },
  
  insertGoodsData() {
    const data = [
      { id: 1, goods_name: '笔记本电脑', quantity: 5, price: 2999.99, supplier: '供应商A', notes: '新品入库', arrival_date: new Date().toISOString() },
      { id: 2, goods_name: '鼠标', quantity: 100, price: 49.99, supplier: '供应商B', notes: '常规进货', arrival_date: new Date().toISOString() },
      { id: 3, goods_name: '键盘', quantity: 50,  price: 129.99, supplier: '供应商C', notes: '更新库存', arrival_date: new Date().toISOString() },
      { id: 4, goods_name: '显示器', quantity: 20, price: 999.99, supplier: '供应商D', notes: '大屏显示器', arrival_date: new Date().toISOString() }
    ];
    
    mockDatabase.goods_in = data;
    mockDatabase.inventory = [
      { id: 1, goods_id: 1, goods_name: '笔记本电脑', current_quantity: 5, min_quantity: 2, max_quantity: 10, location: '仓库A', last_update: new Date().toISOString() },
      { id: 2, goods_id: 2, goods_name: '鼠标', current_quantity: 100, min_quantity: 50, max_quantity: 200, location: '仓库B', last_update: new Date().toISOString() },
      { id: 3, goods_id: 3, goods_name: '键盘', current_quantity: 50, min_quantity: 20, max_quantity: 100, location: '仓库C', last_update: new Date().toISOString() },
      { id: 4, goods_id: 4, goods_name: '显示器', current_quantity: 20, min_quantity: 5, max_quantity: 30, location: '仓库D', last_update: new Date().toISOString() }
    ];
    
    return { success: true, count: 4 };
  },
  
  queryInventoryData() {
    return { success: true, data: mockDatabase.inventory };
  },
  
  queryGoodsInData() {
    return { success: true, data: mockDatabase.goods_in };
  },
  
  clearDatabase() {
    mockDatabase.goods_in = [];
    mockDatabase.inventory = [];
    return { success: true, message: '模拟数据库已清空' };
  }
};

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
          return ${JSON.stringify(mockDatabase.initDatabase())};
        },
        insertGoodsData: () => {
          return ${JSON.stringify(mockDatabase.insertGoodsData())};
        },
        queryInventoryData: () => {
          return ${JSON.stringify(mockDatabase.queryInventoryData())};
        },
        queryGoodsInData: () => {
          return ${JSON.stringify(mockDatabase.queryGoodsInData())};
        },
        clearDatabase: () => {
          return ${JSON.stringify(mockDatabase.clearDatabase())};
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

app.whenReady().then(() => {
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