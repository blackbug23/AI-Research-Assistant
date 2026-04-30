// 库存扣减引擎模块
// 基于FEFO（近效期先出）进行库存扣减

class StockDeductionEngine {
  constructor(stockData) {
    this.stockData = stockData || [];
    this.stockLog = [];
  }

  /**
   * 扣减库存
   * @param {array} deductionItems - 扣减项 [{reagent_master_id, quantity, unit}]
   * @param {number} elnId - 实验记录ID
   * @returns {object} - 扣减结果
   */
  deductStock(deductionItems, elnId) {
    console.log('库存扣减开始:', deductionItems);

    // 验证输入数据
    if (!deductionItems || deductionItems.length === 0) {
      return {
        success: false,
        error: '扣减项为空'
      };
    }

    // 执行扣减事务
    const deductionResult = [];
    const errors = [];

    for (const item of deductionItems) {
      try {
        const stockItem = this.findStockItem(item.reagent_master_id, item.quantity, item.unit);
        
        if (!stockItem) {
          errors.push({
            reagent_master_id: item.reagent_master_id,
            reagent_name: item.reagent_name || '未知试剂',
            quantity: item.quantity,
            unit: item.unit,
            error: '库存不足或找不到对应试剂'
          });
          continue;
        }

        // 扣减库存
        stockItem.current_quantity -= item.quantity;
        
        if (stockItem.current_quantity < stockItem.min_quantity) {
          errors.push({
            reagent_master_id: item.reagent_master_id,
            reagent_name: stockItem.reagent_name,
            quantity: item.quantity,
            unit: item.unit,
            error: `库存低于最小值 ${stockItem.min_quantity}，触发提醒`
          });
        }

        // 记录扣减日志
        const logEntry = {
          inventory_id: stockItem.id,
          reagent_master_id: item.reagent_master_id,
          reagent_name: stockItem.reagent_name,
          quantity: item.quantity,
          unit: item.unit,
          change_type: 'deduction',
          remaining: stockItem.current_quantity,
          eln_id: elnId,
          created_at: new Date().toISOString()
        };

        this.stockLog.push(logEntry);
        deductionResult.push(logEntry);
      } catch (error) {
        errors.push({
          reagent_master_id: item.reagent_master_id,
          reagent_name: item.reagent_name || '未知试剂',
          quantity: item.quantity,
          unit: item.unit,
          error: error.message
        });
      }
    }

    // 如果有错误，回滚事务
    if (errors.length > 0) {
      console.error('库存扣减失败，触发回滚:', errors);
      this.rollbackTransaction();
      
      return {
        success: false,
        errors,
        message: '库存不足，扣减失败'
      };
    }

    console.log('库存扣减成功:', deductionResult);
    
    return {
      success: true,
      deduction_logs: deductionResult,
      stock_logs: this.stockLog,
      message: '库存扣减成功'
    };
  }

  /**
   * 查找库存项（FEFO原则）
   * @param {number} reagentMasterId - 试剂主ID
   * @param {number} quantity - 用量
   * @param {string} unit - 单位
   * @returns {object} - 库存项
   */
  findStockItem(reagentMasterId, quantity, unit) {
    // 查找所有匹配的库存项
    const matchingItems = this.stockData.filter(item => 
      item.reagent_master_id === reagentMasterId &&
      item.current_quantity >= quantity
    );

    if (matchingItems.length === 0) {
      return null; // 库存不足
    }

    // FEFO：近效期先出，按有效期排序
    const sortedItems = matchingItems.sort((a, b) => {
      // 如果都有有效期，按有效期排序
      if (a.expiration_date && b.expiration_date) {
        return new Date(a.expiration_date) - new Date(b.expiration_date);
      }
      // 否则按库存ID排序
      return a.id - b.id;
    });

    // 返回最近有效期的项
    return sortedItems[0];
  }

  /**
   * 回滚事务
   */
  rollbackTransaction() {
    console.log('库存扣减回滚事务');
    // 清除所有日志
    this.stockLog = [];
  }

  /**
   * 检查库存充足性
   * @param {array} deductionItems - 扣减项
   * @returns {object} - 检查结果
   */
  checkStockAvailability(deductionItems) {
    const availabilityResult = [];
    const warnings = [];

    for (const item of deductionItems) {
      const stockItem = this.findStockItem(item.reagent_master_id, item.quantity, item.unit);
      
      if (!stockItem) {
        availabilityResult.push({
          reagent_master_id: item.reagent_master_id,
          reagent_name: item.reagent_name || '未知试剂',
          quantity: item.quantity,
          unit: item.unit,
          available: false,
          reason: '库存不足'
        });
      } else {
        availabilityResult.push({
          reagent_master_id: item.reagent_master_id,
          reagent_name: stockItem.reagent_name,
          quantity: item.quantity,
          unit: item.unit,
          available: true,
          remaining: stockItem.current_quantity - item.quantity,
          expiration_date: stockItem.expiration_date
        });

        // 检查是否低于最小库存
        if (stockItem.current_quantity - item.quantity < stockItem.min_quantity) {
          warnings.push({
            reagent_master_id: item.reagent_master_id,
            reagent_name: stockItem.reagent_name,
            current: stockItem.current_quantity,
            deduction: item.quantity,
            remaining: stockItem.current_quantity - item.quantity,
            min_quantity: stockItem.min_quantity,
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
   * 生成库存扣减摘要
   * @param {array} deductionLogs - 扣减日志
   * @returns {string} - 摘要文本
   */
  generateDeductionSummary(deductionLogs) {
    if (!deductionLogs || deductionLogs.length === 0) {
      return '没有库存扣减';
    }

    const summaryLines = deductionLogs.map(log => {
      return `${log.reagent_name}: ${log.quantity}${log.unit} → 剩余 ${log.remaining}${log.unit}`;
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