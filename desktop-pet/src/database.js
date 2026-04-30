// 真实数据库模块 - SQLite实现

const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './desktop-pet.db';
    this.db = null;
    this.initDatabase();
  }

  /**
   * 初始化数据库
   */
  initDatabase() {
    try {
      // 确保数据库目录存在
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = sqlite3(this.dbPath);
      this.createTables();
      
      console.log(`数据库初始化完成: ${this.dbPath}`);
      return { success: true };
    } catch (error) {
      console.error('数据库初始化失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 创建所有表
   */
  createTables() {
    // goods_in 表（第二步已有）
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS goods_in (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goods_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2),
        supplier TEXT,
        notes TEXT,
        arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        storage_location TEXT
      )
    `);

    // inventory 表（第二步已有）
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reagent_master_id INTEGER NOT NULL,
        reagent_name TEXT NOT NULL,
        current_quantity DECIMAL(10,2) NOT NULL,
        unit TEXT NOT NULL,
        min_quantity DECIMAL(10,2) DEFAULT 0,
        max_quantity DECIMAL(10,2),
        expiration_date DATE,
        location TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // draft_eln 表（第三步新增）
    this.db.exec(`
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
      )
    `);

    // stock_log 表（第三步新增）
    this.db.exec(`
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
      )
    `);

    // eln_records 表（第三步新增）
    this.db.exec(`
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
      )
    `);
  }

  /**
   * 执行迁移脚本
   * @param {string} migrationFile - 迁移文件路径
   */
  runMigration(migrationFile) {
    try {
      const migration = require(migrationFile);
      const result = migration.up(this.db);
      
      console.log(`迁移完成: ${migrationFile}`);
      return result;
    } catch (error) {
      console.error(`迁移失败: ${migrationFile}`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 执行回滚脚本
   * @param {string} migrationFile - 迁移文件路径
   */
  rollbackMigration(migrationFile) {
    try {
      const migration = require(migrationFile);
      const result = migration.down(this.db);
      
      console.log(`回滚完成: ${migrationFile}`);
      return result;
    } catch (error) {
      console.error(`回滚失败: ${migrationFile}`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 事务执行库存扣减
   * @param {array} deductionItems - 扣减项 [{reagent_master_id, quantity, unit}]
   * @param {number} elnId - 实验记录ID
   */
  deductStockTransaction(deductionItems, elnId) {
    return this.db.transaction(() => {
      const deductionResult = [];
      
      for (const item of deductionItems) {
        // 查找库存项（FEFO原则）
        const stockItem = this.db.prepare(
          `SELECT * FROM inventory 
           WHERE reagent_master_id = ? AND current_quantity >= ? 
           ORDER BY expiration_date ASC LIMIT 1`
        ).get(item.reagent_master_id, item.quantity);

        if (!stockItem) {
          throw new Error(`库存不足: ${item.reagent_name || '未知试剂'}`);
        }

        // 扣减库存
        const updatedQuantity = stockItem.current_quantity - item.quantity;
        this.db.prepare(
          `UPDATE inventory 
           SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`
        ).run(updatedQuantity, stockItem.id);

        // 记录扣减日志
        this.db.prepare(
          `INSERT INTO stock_log 
           (inventory_id, reagent_master_id, reagent_name, quantity, unit, change_type, remaining, eln_id) 
           VALUES (?, ?, ?, ?, ?, 'deduction', ?, ?)`
        ).run(
          stockItem.id,
          item.reagent_master_id,
          stockItem.reagent_name,
          item.quantity,
          item.unit,
          updatedQuantity,
          elnId
        );

        deductionResult.push({
          inventory_id: stockItem.id,
          reagent_master_id: item.reagent_master_id,
          reagent_name: stockItem.reagent_name,
          quantity: item.quantity,
          unit: item.unit,
          remaining: updatedQuantity
        });

        // 检查库存警戒线
        if (updatedQuantity < stockItem.min_quantity) {
          console.warn(`库存警戒: ${stockItem.reagent_name} 剩余 ${updatedQuantity}${stockItem.unit} 低于最小库存 ${stockItem.min_quantity}`);
        }
      }

      return deductionResult;
    });
  }

  /**
   * 创建实验记录草稿
   * @param {object} draftData - 草稿数据
   */
  createDraftTransaction(draftData) {
    const result = this.db.prepare(
      `INSERT INTO draft_eln 
       (title, objective, principle, materials_json, raw_procedures, raw_results, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'draft')`
    ).run(
      draftData.title,
      draftData.objective,
      draftData.principle || '',
      JSON.stringify(draftData.materials_json),
      draftData.raw_procedures,
      draftData.raw_results
    );

    return {
      success: true,
      draft: {
        id: result.lastInsertRowid,
        ...draftData,
        status: 'draft'
      }
    };
  }

  /**
   * 更新实验记录草稿
   * @param {number} draftId - 草稿ID
   * @param {object} updateData - 更新数据
   */
  updateDraftTransaction(draftId, updateData) {
    this.db.prepare(
      `UPDATE draft_eln 
       SET title = ?, objective = ?, principle = ?, materials_json = ?, raw_procedures = ?, raw_results = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).run(
      updateData.title,
      updateData.objective,
      updateData.principle || '',
      JSON.stringify(updateData.materials_json),
      updateData.raw_procedures,
      updateData.raw_results,
      draftId
    );

    return { success: true };
  }

  /**
   * 获取草稿
   * @param {number} draftId - 草稿ID
   */
  getDraftTransaction(draftId) {
    const draft = this.db.prepare(
      `SELECT * FROM draft_eln WHERE id = ?`
    ).get(draftId);

    if (!draft) {
      return null;
    }

    return {
      ...draft,
      materials_json: JSON.parse(draft.materials_json)
    };
  }

  /**
   * 完成ELN记录
   * @param {object} elnData - ELN数据
   */
  completeELNTransaction(elnData) {
    const result = this.db.prepare(
      `INSERT INTO eln_records 
       (experiment_code, experiment_title, objective, principle, procedures, results, conclusion, 
        materials_json, materials_snapshot, json_content, pdf_path, stock_deductions, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`
    ).run(
      elnData.experiment_code,
      elnData.experiment_title,
      elnData.objective,
      elnData.principle || '',
      elnData.procedures,
      elnData.results,
      elnData.conclusion || '',
      elnData.materials_json,
      elnData.materials_snapshot,
      elnData.json_content,
      elnData.pdf_path || '',
      elnData.stock_deductions || '',
      'completed'
    );

    return {
      success: true,
      eln_id: result.lastInsertRowid
    };
  }

  /**
   * 删除草稿
   * @param {number} draftId - 草稿ID
   */
  deleteDraftTransaction(draftId) {
    this.db.prepare(
      `DELETE FROM draft_eln WHERE id = ?`
    ).run(draftId);

    return { success: true };
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('数据库连接已关闭');
    }
  }
}

module.exports = DatabaseManager;