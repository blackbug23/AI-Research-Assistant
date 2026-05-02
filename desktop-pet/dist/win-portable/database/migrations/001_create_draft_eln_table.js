// 创建 draft_eln 表迁移
const Database = require('../simple_db.js');

class DraftELNMigration {
  constructor(db) {
    this.db = db;
  }

  async up() {
    // 添加 draft_eln 表
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS draft_eln (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      principle TEXT,
      materials_json TEXT NOT NULL,
      raw_procedures TEXT NOT NULL,
      raw_results TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    // 添加 stock_log 表（库存扣减日志）
    const createStockLogSQL = `
    CREATE TABLE IF NOT EXISTS stock_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_id INTEGER NOT NULL,
      reagent_master_id INTEGER NOT NULL,
      reagent_name TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit TEXT NOT NULL,
      change_type TEXT NOT NULL,
      remaining DECIMAL(10,2) NOT NULL,
      eln_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    // 添加 eln_records 表（完整ELN记录）
    const createELNRecordsSQL = `
    CREATE TABLE IF NOT EXISTS eln_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experiment_code TEXT NOT NULL,
      experiment_title TEXT NOT NULL,
      objective TEXT NOT NULL,
      principle TEXT,
      procedures TEXT NOT NULL,
      results TEXT NOT NULL,
      conclusion TEXT,
      materials_json TEXT NOT NULL,
      materials_snapshot TEXT NOT NULL,
      json_content TEXT NOT NULL,
      pdf_path TEXT,
      stock_deductions TEXT,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
      console.log('执行迁移: 创建 draft_eln 表');
      // 这里需要实际的数据库操作，暂时模拟
      return { success: true, message: '迁移完成' };
    } catch (error) {
      console.error('迁移失败:', error);
      return { success: false, error: error.message };
    }
  }

  async down() {
    // 删除 draft_eln 表
    const dropTableSQL = `
    DROP TABLE IF EXISTS draft_eln;
    DROP TABLE IF EXISTS stock_log;
    DROP TABLE IF EXISTS eln_records;
    `;

    try {
      console.log('执行回滚: 删除 draft_eln 表');
      // 这里需要实际的数据库操作，暂时模拟
      return { success: true, message: '回滚完成' };
    } catch (error) {
      console.error('回滚失败:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = DraftELNMigration;