const Database = require('./database.js');

async function initDatabase() {
  const result = await Database.initDatabase();
  return result;
}

async function insertFromQRCode(qrcodeData) {
  const result = await Database.insertFromQRCode(qrcodeData);
  return result;
}

async function getEmptyLocationRecords() {
  const result = await Database.getEmptyLocationRecords();
  return result;
}

async function updateStorageLocation(goodsId, location) {
  const result = await Database.updateStorageLocation(goodsId, location);
  return result;
}

async function insertTestData() {
  const result = await Database.insertTestData();
  return result;
}

async function queryInventoryData() {
  const result = await Database.queryInventoryData();
  return result;
}

async function queryGoodsInData() {
  const result = await Database.queryGoodsInData();
  return result;
}

async function clearDatabase() {
  const result = await Database.clearDatabase();
  return result;
}

function startReminderTimer() {
  return { success: true, message: '提醒定时器已启动' };
}

function scanQRCode(callback) {
  const mockQRData = [
    '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
    '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
    '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C'
  ];
  
  const randomQR = mockQRData[Math.floor(Math.random() * mockQRData.length)];
  
  setTimeout(() => {
    callback(randomQR);
  }, 1000);
}

async function simulateQRScan() {
  const qrcodes = [
    '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
    '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
    '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C',
    '商品名称：显示器 数量：20 价格：999.99 供应商：供应商D'
  ];
  
  const randomQR = qrcodes[Math.floor(Math.random() * qrcodes.length)];
  const result = await insertFromQRCode(randomQR);
  return result;
}

function getVoiceLocationInput() {
  const locations = [
    '仓库A-货架1',
    '仓库B-货架3',
    '仓库C-货架5',
    '仓库D-货架7'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

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