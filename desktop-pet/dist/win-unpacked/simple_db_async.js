// 异步简化数据库模块 - 使用JSON文件存储，无需SQLite依赖
const fs = require('fs');
const path = require('path');

class SimpleDatabaseAsync {
  constructor() {
    this.goodsFilePath = path.join(__dirname, 'goods_data.json');
    this.inventoryFilePath = path.join(__dirname, 'inventory_data.json');
    this.loadData();
    this.startTimer();
  }

  loadData() {
    try {
      // 如果文件不存在，初始化数据
      if (!fs.existsSync(this.goodsFilePath)) {
        this.goodsData = [];
        this.saveData();
      } else {
        const goodsData = fs.readFileSync(this.goodsFilePath, 'utf8');
        this.goodsData = JSON.parse(goodsData);
      }

      if (!fs.existsSync(this.inventoryFilePath)) {
        this.inventoryData = [];
        this.saveData();
      } else {
        const inventoryData = fs.readFileSync(this.inventoryFilePath, 'utf8');
        this.inventoryData = JSON.parse(inventoryData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      this.goodsData = [];
      this.inventoryData = [];
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.goodsFilePath, JSON.stringify(this.goodsData));
      fs.writeFileSync(this.inventoryFilePath, JSON.stringify(this.inventoryData));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  // QR码解析和数据入库
  async insertFromQRCode(qrcodeData) {
    try {
      // QR码解析 - 正则表达式提取信息
      const regex = /(商品|名称|品名):(.+)|数量:(.+)|价格:(.+)|供应商:(.+)|备注:(.+)/i;
      const matches = qrcodeData.match(regex);
      
      let goods_name = '';
      let quantity = 1;
      let price = 0;
      let supplier = '';
      let notes = '';
      
      if (matches) {
        // 提取商品名称
        if (matches[2]) goods_name = matches[2].trim();
        
        // 提取数量
        if (matches[3]) quantity = parseInt(matches[3]) || 1;
        
        // 提取价格
        if (matches[4]) price = parseFloat(matches[4]) || 0;
        
        // 提取供应商
        if (matches[5]) supplier = matches[5].trim();
        
        // 提取备注
        if (matches[6]) notes = matches[6].trim();
      } else {
        // 如果没有匹配，使用原始文本作为商品名称
        goods_name = qrcodeData;
      }

      // 生成唯一ID
      const id = this.goodsData.length > 0 ? this.goodsData[this.goodsData.length - 1].id + 1 : 1;

      // 入库数据
      const newGoods = {
        id,
        goods_name,
        quantity,
        price,
        supplier,
        notes,
        qrcode_data: qrcodeData,
        storage_location: null,
        arrival_date: new Date().toISOString(),
        last_update: new Date().toISOString()
      };

      this.goodsData.push(newGoods);
      
      // 更新库存
      await this.updateInventory(goods_name, quantity);
      
      this.saveData();
      
      console.log(`入库成功：${goods_name}, 数量：${quantity}, storage_location: NULL`);
      
      return {
        success: true,
        id,
        goods_name,
        quantity,
        price,
        supplier,
        notes,
        qrcode_data: qrcodeData,
        storage_location: null
      };
    } catch (error) {
      console.error('QR码入库失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 更新库存
  async updateInventory(goodsName, quantity) {
    // 查找现有库存
    const existingItem = this.inventoryData.find(item => item.goods_name === goodsName);
    
    if (existingItem) {
      existingItem.current_quantity += quantity;
      existingItem.last_update = new Date().toISOString();
    } else {
      const inventoryId = this.inventoryData.length > 0 ? this.inventoryData[this.inventoryData.length - 1].id + 1 : 1;
      
      const newInventory = {
        id: inventoryId,
        goods_id: inventoryId,
        goods_name: goodsName,
        current_quantity: quantity,
        min_quantity: 10,
        max_quantity: 1000,
        location: null,
        last_update: new Date().toISOString()
      };
      
      this.inventoryData.push(newInventory);
    }
    
    this.saveData();
  }

  // 获取空位置的入库记录
  async getEmptyLocationRecords() {
    const emptyRecords = this.goodsData.filter(goods => goods.storage_location === null);
    
    return {
      success: true,
      count: emptyRecords.length,
      data: emptyRecords
    };
  }

  // 更新存储位置
  async updateStorageLocation(goodsId, location) {
    const goodsItem = this.goodsData.find(item => item.id === goodsId);
    
    if (goodsItem) {
      goodsItem.storage_location = location;
      goodsItem.last_update = new Date().toISOString();
      
      // 更新库存位置
      const inventoryItem = this.inventoryData.find(item => item.goods_name === goodsItem.goods_name);
      if (inventoryItem) {
        inventoryItem.location = location;
        inventoryItem.last_update = new Date().toISOString();
      }
      
      this.saveData();
      
      return {
        success: true,
        message: `位置更新成功：${goodsId} -> ${location}`,
        changes: 1
      };
    } else {
      return {
        success: false,
        message: '未找到对应商品',
        changes: 0
      };
    }
  }

  // 定时器检查空位置
  startTimer() {
    // 每5分钟检查一次
    setInterval(async () => {
      const emptyRecords = await this.getEmptyLocationRecords();
      
      if (emptyRecords.success && emptyRecords.count > 0) {
        console.log('发现空位置记录:', emptyRecords.count);
        // 触发桌宠提醒
        this.triggerPetReminder(emptyRecords.data);
      }
    }, 5 * 60 * 1000); // 5分钟
  }

  // 触发桌宠提醒
  async triggerPetReminder(records) {
    const message = records.map(r => {
      return `${r.goods_name} (数量：${r.quantity})`;
    }).join(', ');
    
    console.log(`提醒：新到的 ${message} 还没放好~`);
    
    // 这里可以触发UI提醒（通过IPC发送到前端）
    // 例如：event.emit('reminder', records);
  }

  // 查询库存数据
  async queryInventoryData() {
    return { success: true, data: this.inventoryData };
  }

  // 查询入库数据
  async queryGoodsInData() {
    return { success: true, data: this.goodsData };
  }

  // 清空数据库
  async clearDatabase() {
    this.goodsData = [];
    this.inventoryData = [];
    this.saveData();
    
    return { success: true, message: '数据库已清空' };
  }

  // 初始化测试数据
  async insertTestData() {
    const data = [
      { goods_name: '笔记本电脑', quantity: 5, price: 2999.99, supplier: '供应商A', notes: '新品入库', qrcode_data: 'QR:笔记本-001' },
      { goods_name: '鼠标', quantity: 100, price: 49.99, supplier: '供应商B', notes: '常规进货', qrcode_data: 'QR:鼠标-002' },
      { goods_name: '键盘', quantity: 50, price: 129.99, supplier: '供应商C', notes: '更新库存', qrcode_data: 'QR:键盘-003' },
      { goods_name: '显示器', quantity: 20, price: 999.99, supplier: '供应商D', notes: '大屏显示器', qrcode_data: 'QR:显示器-004' }
    ];

    const results = [];
    for (const item of data) {
      const result = await this.insertFromQRCode(item.qrcode_data);
      results.push(result);
    }

    return {
      success: true,
      count: results.length,
      results
    };
  }

  // 初始化数据库
  async initDatabase() {
    return { success: true, message: '异步数据库初始化成功' };
  }
}

// 导出数据库实例
module.exports = new SimpleDatabaseAsync();