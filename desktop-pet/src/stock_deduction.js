// 库存扣减引擎模块 - 真实SQLite实现
// 基于FEFO（近效期先出）进行库存扣减

const db = require('../database.js');

class StockDeductionEngine {
  constructor() {
    this.stockLog = [];
    this._ready = null;
  }

  async _ensureDb() {
    if (!this._ready) {
      this._ready = db.getInstance();
    }
    return this._ready;
  }

  /**
   * 查找库存项（FEFO原则）
   * @param {number} reagentMasterId - 试剂主ID
   * @param {number} quantity - 用量
   * @param {string} unit - 单位
   * @returns {object} - 库存项
   */
  async findStockItem(reagentMasterId, quantity, unit) {
    try {
      const instance = await this._ensureDb();
      const result = instance.db.exec(
        `SELECT * FROM inventory 
         WHERE current_quantity >= ${quantity}
         ORDER BY last_update ASC LIMIT 1`
      );
      if (!result[0] || result[0].values.length === 0) {
        return null;
      }
      const columns = result[0].columns;
      const row = result[0].values[0];
      const stockItem = {};
      for (let i = 0; i < columns.length; i++) {
        stockItem[columns[i]] = row[i];
      }
      return stockItem;
    } catch (error) {
      console.error('查找库存项失败:', error);
      return null;
    }
  }

  /**
   * 检查库存充足性
   * @param {array} deductionItems - 扣减项
   * @returns {object} - 检查结果
   */
  async checkStockAvailability(deductionItems) {
    const availabilityResult = [];
    const warnings = [];

    for (const item of deductionItems) {
      const stockItem = await this.findStockItem(
        item.reagent_master_id || item.goods_id,
        item.quantity,
        item.unit
      );
      
      if (!stockItem) {
        availabilityResult.push({
          reagent_master_id: item.reagent_master_id || item.goods_id,
          reagent_name: item.reagent_name || item.goods_name || '未知试剂',
          quantity: item.quantity,
          unit: item.unit,
          available: false,
          reason: '库存不足'
        });
      } else {
        availabilityResult.push({
          reagent_master_id: stockItem.goods_id,
          reagent_name: stockItem.goods_name,
          quantity: item.quantity,
          unit: item.unit || '个',
          available: true,
          remaining: stockItem.current_quantity - item.quantity,
          expiration_date: stockItem.expiration_date || 'N/A'
        });

        // 检查是否低于最小库存
        if (stockItem.current_quantity - item.quantity < (stockItem.min_quantity || 10)) {
          warnings.push({
            reagent_master_id: stockItem.goods_id,
            reagent_name: stockItem.goods_name,
            current: stockItem.current_quantity,
            deduction: item.quantity,
            remaining: stockItem.current_quantity - item.quantity,
            min_quantity: stockItem.min_quantity || 10,
            warning: '扣减后将低于最小库存'
          });
        }
      }
    }

    return {
      allAvailable: availabilityResult.every(item => item.available),
      availabilityResult,
      warnings
    };
  }

  /**
   * 扣减库存（真实数据库事务）
   * @param {array} deductionItems - 扣减项 [{reagent_master_id, quantity, unit}]
   * @param {number} elnId - 实验记录ID
   * @returns {object} - 扣减结果
   */
  async deductStock(deductionItems, elnId) {
    console.log('库存扣减开始:', deductionItems);

    // 验证输入数据
    if (!deductionItems || deductionItems.length === 0) {
      return {
        success: false,
        error: '扣减项为空'
      };
    }

    // 执行扣减事务
    try {
      const deductionResult = await db.deductStockTransaction(deductionItems, elnId);
      
      console.log('库存扣减成功:', deductionResult);
      
      return {
        success: true,
        deduction_logs: deductionResult,
        message: '库存扣减成功'
      };
    } catch (error) {
      console.error('库存扣减失败:', error);
      
      const errors = deductionItems.map(item => {
        return {
          reagent_master_id: item.reagent_master_id || item.goods_id,
          reagent_name: item.reagent_name || item.goods_name || '未知试剂',
          quantity: item.quantity,
          unit: item.unit || '个',
          error: error.message
        };
      });
      
      return {
        success: false,
        errors,
        message: '库存不足，扣减失败'
      };
    }
  }

  /**
   * 回滚事务
   */
  rollbackTransaction() {
    console.log('库存扣减回滚事务');
    this.stockLog = [];
  }

  /**
   * 生成库存扣减摘要
   * @param {array} deductionLogs - 扣减日志
   * @returns {string} - 摘要文本
   */
  generateDeductionSummary(deductionLogs) {
    if (!deductionLogs || deductionLogs.length === 0) {
      return '没有库存扣减';
    }

    const summaryLines = deductionLogs.map(log => {
      return `${log.reagent_name || log.goods_name}: ${log.quantity}${log.unit || '个'} → 剩余 ${log.remaining}${log.unit || '个'}`;
    });

    return `库存扣减摘要:\n${summaryLines.join('\n')}`;
  }

  /**
   * 模拟库存数据
   * @returns {array} - 模拟库存数据
   */
  static generateMockStockData() {
    const mockStock = [
      {
        id: 1,
        reagent_master_id: 1001,
        reagent_name: '氯化钠',
        current_quantity: 500,
        unit: 'g',
        min_quantity: 50,
        max_quantity: 1000,
        expiration_date: '2026-12-31',
        location: '仓库A-货架1'
      },
      {
        id: 2,
        reagent_master_id: 1002,
        reagent_name: '乙醇',
        current_quantity: 1000,
        unit: 'ml',
        min_quantity: 200,
        max_quantity: 2000,
        expiration_date: '2026-06-30',
        location: '仓库B-货架2'
      },
      {
        id: 3,
        reagent_master_id: 1003,
        reagent_name: '硫酸',
        current_quantity: 200,
        unit: 'ml',
        min_quantity: 50,
        max_quantity: 500,
        expiration_date: '2027-03-15',
        location: '仓库C-货架3'
      },
      {
        id: 4,
        reagent_master_id: 1001,
        reagent_name: '氯化钠',
        current_quantity: 800,
        unit: 'g',
        min_quantity: 50,
        max_quantity: 1000,
        expiration_date: '2027-06-30',
        location: '仓库D-货架4'
      }
    ];

    return mockStock;
  }
}

module.exports = StockDeductionEngine;