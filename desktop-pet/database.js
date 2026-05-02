const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

class DesktopPetDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, 'database.db');
    this.db = null;
    this.init().then(() => {
      this.setupTables();
      this.startTimer();
    });
  }

  async init() {
    try {
      const SQL = await initSqlJs();
      
      // 如果数据库文件存在，读取它
      if (fs.existsSync(this.dbPath)) {
        const buffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(buffer);
      } else {
        // 创建新数据库
        this.db = new SQL.Database();
      }
      
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error);
      // 创建内存数据库
      const SQL = await initSqlJs();
      this.db = new SQL.Database();
      console.log('使用内存数据库');
    }
  }

  setupTables() {
    // goods_in表 - 入库记录
    this.db.run(`CREATE TABLE IF NOT EXISTS goods_in (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goods_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2),
      arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      supplier TEXT,
      notes TEXT,
      qrcode_data TEXT,
      storage_location TEXT DEFAULT NULL,
      last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // inventory表 - 库存
    this.db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goods_id INTEGER NOT NULL,
      goods_name TEXT NOT NULL,
      current_quantity INTEGER NOT NULL DEFAULT 0,
      min_quantity INTEGER NOT NULL DEFAULT 0,
      max_quantity INTEGER NOT NULL DEFAULT 1000,
      location TEXT,
      last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('数据库表创建完成');
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

      // 插入goods_in表（storage_location置空）
      const result = this.db.run(`INSERT INTO goods_in (
        goods_name, quantity, price, supplier, notes, qrcode_data, storage_location
      ) VALUES (?, ?, ?, ?, ?, ?, NULL)`, 
      [goods_name, quantity, price, supplier, notes, qrcodeData]);
      
      // 获取lastInsertRowid
      const selectResult = this.db.exec(`SELECT last_insert_rowid()`);
      const lastInsertRowid = selectResult[0].values[0][0];
      
      // 更新inventory表
      this.db.run(`INSERT OR REPLACE INTO inventory (
        goods_id, goods_name, current_quantity, min_quantity, max_quantity, location, last_update
      ) VALUES (
        ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      )`, [lastInsertRowid, goods_name, quantity, 10, 100, null]);
      
      console.log(`入库成功：${goods_name}, 数量：${quantity}, storage_location: NULL`);
      
      return {
        success: true,
        id: lastInsertRowid,
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

  // 获取空位置的入库记录
  getEmptyLocationRecords() {
    try {
      const result = this.db.exec(`SELECT * FROM goods_in WHERE storage_location IS NULL ORDER BY arrival_date DESC`);
      
      const records = result[0] ? result[0].values.map(row => {
        const columns = result[0].columns;
        const record = {};
        for (let i = 0; i < columns.length; i++) {
          record[columns[i]] = row[i];
        }
        return record;
      }) : [];
      
      return {
        success: true,
        count: records.length,
        data: records
      };
    } catch (error) {
      console.error('查询空位置记录失败:', error);
      return { success: false, error: error.message, count: 0, data: [] };
    }
  }

  // 更新存储位置
  updateStorageLocation(goodsId, location) {
    try {
      const result = this.db.run(`UPDATE goods_in SET storage_location = ?, last_update = CURRENT_TIMESTAMP WHERE id = ?`, [location, goodsId]);
      
      if (result.changes > 0) {
        // 同时更新库存表的location
        const goodsResult = this.db.exec(`SELECT goods_name FROM goods_in WHERE id = ?`, [goodsId]);
        if (goodsResult[0] && goodsResult[0].values.length > 0) {
          const goods_name = goodsResult[0].values[0][0];
          this.db.run(`UPDATE inventory SET location = ?, last_update = CURRENT_TIMESTAMP WHERE goods_name = ?`, [location, goods_name]);
        }
        
        return {
          success: true,
          message: `位置更新成功：${goodsId} -> ${location}`,
          changes: result.changes
        };
      } else {
        return {
          success: false,
          message: '未找到对应商品',
          changes: 0
        };
      }
    } catch (error) {
      console.error('更新存储位置失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 定时器检查空位置
  startTimer() {
    // 每5分钟检查一次
    setInterval(() => {
      const emptyRecords = this.getEmptyLocationRecords();
      
      if (emptyRecords.success && emptyRecords.count > 0) {
        console.log('发现空位置记录:', emptyRecords.count);
        // 触发桌宠提醒
        this.triggerPetReminder(emptyRecords.data);
      }
    }, 5 * 60 * 1000); // 5分钟
  }

  // 触发桌宠提醒
  triggerPetReminder(records) {
    const message = records.map(r => {
      return `${r.goods_name} (数量：${r.quantity})`;
    }).join(', ');
    
    console.log(`提醒：新到的 ${message} 还没放好~`);
    
    // 这里可以触发UI提醒（通过IPC发送到前端）
    // 例如：event.emit('reminder', records);
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

  // 查询库存数据
  queryInventoryData() {
    const result = this.db.exec(`SELECT * FROM inventory`);
    const data = result[0] ? result[0].values.map(row => {
      const columns = result[0].columns;
      const record = {};
      for (let i = 0; i < columns.length; i++) {
        record[columns[i]] = row[i];
      }
      return record;
    }) : [];
    
    return { success: true, data };
  }

  // 查询入库数据
  queryGoodsInData() {
    const result = this.db.exec(`SELECT * FROM goods_in`);
    const data = result[0] ? result[0].values.map(row => {
      const columns = result[0].columns;
      const record = {};
      for (let i = 0; i < columns.length; i++) {
        record[columns[i]] = row[i];
      }
      return record;
    }) : [];
    
    return { success: true, data };
  }

  // 清空数据库
  clearDatabase() {
    this.db.run(`DELETE FROM goods_in`);
    this.db.run(`DELETE FROM inventory`);
    
    return { success: true, message: '数据库已清空' };
  }

  // 保存数据库到文件
  saveDatabase() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
      console.log('数据库已保存到文件');
    } catch (error) {
      console.error('保存数据库失败:', error);
    }
  }
}

// 导出数据库实例（异步初始化）
async function initDatabaseInstance() {
  const db = new DesktopPetDatabase();
  // 等待初始化完成
  while (!db.db) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return db;
}

const dbInstancePromise = initDatabaseInstance();

// 导出方法 + 类（供 src/*.js 使用）
module.exports = {
  DesktopPetDatabase,
  initDatabase: async () => {
    const db = await dbInstancePromise;
    return db;
  },
  insertFromQRCode: async (qrcodeData) => {
    const db = await dbInstancePromise;
    return db.insertFromQRCode(qrcodeData);
  },
  getEmptyLocationRecords: async () => {
    const db = await dbInstancePromise;
    return db.getEmptyLocationRecords();
  },
  updateStorageLocation: async (goodsId, location) => {
    const db = await dbInstancePromise;
    return db.updateStorageLocation(goodsId, location);
  },
  insertTestData: async () => {
    const db = await dbInstancePromise;
    return db.insertTestData();
  },
  queryInventoryData: async () => {
    const db = await dbInstancePromise;
    return db.queryInventoryData();
  },
  queryGoodsInData: async () => {
    const db = await dbInstancePromise;
    return db.queryGoodsInData();
  },
  clearDatabase: async () => {
    const db = await dbInstancePromise;
    return db.clearDatabase();
  },
  triggerPetReminder: async (records) => {
    const db = await dbInstancePromise;
    return db.triggerPetReminder(records);
  },
  saveDatabase: async () => {
    const db = await dbInstancePromise;
    return db.saveDatabase();
  },
  startReminderTimer: async () => {
    const db = await dbInstancePromise;
    return db.startTimer();
  },
  // 获取底层数据库实例（供高级使用）
  getInstance: async () => {
    const db = await dbInstancePromise;
    return db;
  }
};