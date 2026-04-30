// QR码扫描入库流程测试
const Database = require('./database.js');

console.log('QR码扫描入库系统测试');

// 初始化数据库
Database.initDatabase();

// 测试QR码扫描入库
console.log('=== 测试QR码扫描入库 ===');
const testQRData = [
  '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
  '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
  '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C',
  '商品名称：显示器 数量：20 价格：999.99 供应商：供应商D'
];

for (const qrData of testQRData) {
  console.log(`扫描QR码：${qrData}`);
  const result = Database.insertFromQRCode(qrData);
  
  if (result.success) {
    console.log(`入库成功：${result.goods_name}, 数量：${result.quantity}`);
    console.log(`storage_location: ${result.storage_location}`);
  } else {
    console.log(`入库失败：${result.error}`);
  }
}

// 测试查询空位置记录
console.log('=== 测试查询空位置记录 ===');
const emptyRecords = Database.getEmptyLocationRecords();
if (emptyRecords.success) {
  console.log(`发现 ${emptyRecords.count} 个未录入位置的商品：`);
  
  for (const record of emptyRecords.data) {
    console.log(`  ${record.id}: ${record.goods_name} (${record.quantity})`);
  }
  
  // 触发桌宠提醒
  Database.triggerPetReminder(emptyRecords.data);
}

// 测试位置录入
console.log('=== 测试位置录入 ===');
if (emptyRecords.success && emptyRecords.data.length > 0) {
  const firstGoods = emptyRecords.data[0];
  
  console.log(`录入位置：${firstGoods.id}: ${firstGoods.goods_name}`);
  
  // 模拟语音录入位置
  const locations = [
    '仓库A-货架1',
    '仓库B-货架3',
    '仓库C-货架5',
    '仓库D-货架7'
  ];
  
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  console.log(`语音输入位置：${randomLocation}`);
  
  const updateResult = Database.updateStorageLocation(firstGoods.id, randomLocation);
  if (updateResult.success) {
    console.log(`位置更新成功：${updateResult.message}`);
  }
}

// 查询入库数据
console.log('=== 查询goods_in数据 ===');
const goodsInData = Database.queryGoodsInData();
if (goodsInData.success) {
  console.log(`入库记录总数：${goodsInData.data.length}`);
  
  for (const goods of goodsInData.data) {
    console.log(`  ${goods.id}: ${goods.goods_name} (${goods.quantity}) - ${goods.storage_location || '未录入'}`);
  }
}

// 查询库存数据
console.log('=== 查询inventory数据 ===');
const inventoryData = Database.queryInventoryData();
if (inventoryData.success) {
  console.log(`库存记录总数：${inventoryData.data.length}`);
  
  for (const item of inventoryData.data) {
    console.log(`  ${item.id}: ${item.goods_name} (${item.current_quantity}) - ${item.location || '未录入'}`);
  }
}

// 定时器测试
console.log('=== 定时器测试 ===');
console.log('后台定时器已启动，每5分钟检查一次');

console.log('=== 测试完成 ===');