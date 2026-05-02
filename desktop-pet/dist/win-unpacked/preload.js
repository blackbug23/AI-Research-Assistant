const Database = require('./database.js');

function initDatabase() {
  const result = Database.initDatabase();
  return result;
}

function insertFromQRCode(qrcodeData) {
  const result = Database.insertFromQRCode(qrcodeData);
  return result;
}

function getEmptyLocationRecords() {
  const result = Database.getEmptyLocationRecords();
  return result;
}

function updateStorageLocation(goodsId, location) {
  const result = Database.updateStorageLocation(goodsId, location);
  return result;
}

function insertTestData() {
  const result = Database.insertTestData();
  return result;
}

function queryInventoryData() {
  const result = Database.queryInventoryData();
  return result;
}

function queryGoodsInData() {
  const result = Database.queryGoodsInData();
  return result;
}

function clearDatabase() {
  const result = Database.clearDatabase();
  return result;
}

function startReminderTimer() {
  // 定时器已经在 database.js 中启动
  return { success: true, message: '提醒定时器已启动' };
}

function scanQRCode(callback) {
  // 模拟QR码扫描，实际项目中会连接摄像头
  const mockQRData = [
    '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
    '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
    '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C'
  ];
  
  const randomQR = mockQRData[Math.floor(Math.random() * mockQRData.length)];
  
  // 模拟扫描过程
  setTimeout(() => {
    callback(randomQR);
  }, 1000);
}

function simulateQRScan() {
  const qrcodes = [
    '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
    '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
    '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C',
    '商品名称：显示器 数量：20 价格：999.99 供应商：供应商D'
  ];
  
  const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
  const result = insertFromQRCode(randomQR);
  
  return result;
}

function getVoiceLocationInput() {
  // 模拟语音输入
  const locations = [
    '仓库A-货架1',
    '仓库B-货架3',
    '仓库C-货架5',
    '仓库D-货架7'
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
}

// 导出所有功能
module.exports = {
  initDatabase,
  insertFromQRCode,
  getEmptyLocationRecords,
  updateStorageLocation,
  insertTestData,
  queryInventoryData,
  queryGoodsInData,
  clearDatabase,
  startReminderTimer,
  scanQRCode,
  simulateQRScan,
  getVoiceLocationInput
};