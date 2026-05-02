// QR码扫描模块 - 集成到实验记录采集

class QRScanner {
  constructor() {
    this.scannerApiUrl = process.env.QR_SCAN_API_URL || 'http://localhost:3000/api/scan';
  }

  /**
   * 扫描QR码获取试剂信息
   * @param {string} qrCodeData - QR码数据
   * @returns {object} - 试剂信息
   */
  scanQR(qrCodeData) {
    try {
      // 模拟QR码扫描
      console.log('扫描QR码:', qrCodeData);
      
      // QR码解析（模拟第二步的逻辑）
      const regex = /名称：(\w+).*数量：(\d+).*价格：(\d+\.\d+).*供应商：(\w+) \((\d+)\)/;
      const match = qrCodeData.match(regex);
      
      if (!match) {
        return {
          success: false,
          error: 'QR码格式不正确'
        };
      }

      const reagentName = match[1];
      const quantity = parseInt(match[2]);
      const price = parseFloat(match[3]);
      const supplier = match[4];
      const supplierCode = parseInt(match[5]);

      // 查找库存中的试剂
      const reagent = this.findReagentByName(reagentName);
      
      if (!reagent) {
        return {
          success: false,
          reagent_name: reagentName,
          quantity,
          price,
          supplier,
          supplierCode,
          error: '试剂不在库存中'
        };
      }

      return {
        success: true,
        reagent_master_id: reagent.reagent_master_id,
        reagent_name: reagentName,
        quantity,
        unit: reagent.unit,
        price,
        supplier,
        supplierCode,
        current_quantity: reagent.current_quantity,
        min_quantity: reagent.min_quantity,
        expiration_date: reagent.expiration_date,
        location: reagent.location
      };
    } catch (error) {
      console.error('QR码扫描失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 通过试剂名称查找库存
   * @param {string} reagentName - 试剂名称
   * @returns {object} - 库存试剂信息
   */
  findReagentByName(reagentName) {
    // 模拟库存查找
    const mockInventory = [
      {
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
        reagent_master_id: 1003,
        reagent_name: '硫酸',
        current_quantity: 200,
        unit: 'ml',
        min_quantity: delay.quantity,
        max_quantity: 500,
        expiration_date: '2027-03-15',
        location: '仓库C-货架3'
      }
    ];

    return mockInventory.find(item => item.reagent_name === reagentName);
  }

  /**
   * 从库存选择试剂
   * @param {number} reagentMasterId - 试剂主ID
   * @param {number} quantity - 用量
   * @param {string} unit - 单位
   * @returns {object} - 选择的试剂信息
   */
  selectReagentFromStock(reagentMasterId, quantity, unit) {
    try {
      console.log('从库存选择试剂:', reagentMasterId, quantity, unit);
      
      // 模拟库存选择
      const mockInventory = [
        {
          reagent_master_id: 1001,
          reagent_name: '氯化钠',
          current_quantity: 500,
          unit: 'g',
          min_quantity: 50,
          expiration_date: '2026-12-31',
          location: '仓库A-货架1'
        },
        {
          reagent_master_id: 1002,
          reagent_name: '乙醇',
          current_quantity: 1000,
          unit: 'ml',
          min_quantity: 200,
          expiration_date: '2026-06-30',
          location: '仓库B-货架2'
        },
        {
          reagent_master_id: 1003,
          reagent_name: '硫酸',
          current_quantity: 200,
          unit: 'ml',
          min_quantity: 50,
          expiration_date: '2027-03-15',
          location: '仓库C-货架3'
        }
      ];

      const reagent = mockInventory.find(item => item.reagent_master_id === reagentMasterId);
      
      if (!reagent) {
        return {
          success: false,
          reagent_master_id: reagentMasterId,
          quantity,
          unit,
          error: '试剂不存在'
        };
      }

      if (reagent.current_quantity < quantity) {
        return {
          success: false,
          reagent_name: reagent.reagent_name,
          reagent_master_id: reagentMasterId,
          quantity,
          unit,
          current_quantity: reagent.current_quantity,
          error: `库存不足，当前库存 ${reagent.current_quantity}${reagent.unit}`
        };
      }

      return {
        success: true,
        reagent_master_id: reagentMasterId,
        reagent_name: reagent.reagent_name,
        quantity,
        unit,
        current_quantity: reagent.current_quantity,
        min_quantity: reagent.min_quantity,
        expiration_date: reagent.expiration_date,
        location: reagent.location,
        remaining: reagent.current_quantity - quantity
      };
    } catch (error) {
      console.error('库存选择失败:', error);
      return {
        success: false,
        reagent_master_id: reagentMasterId,
        quantity,
        unit,
        error: error.message
      };
    }
  }

  /**
   * 扫描并选择试剂
   * @param {string} qrCodeData - QR码数据
   * @returns {object} - 试剂信息
   */
  scanAndSelectReagent(qrCodeData) {
    const scanResult = this.scanQR(qrCodeData);
    
    if (!scanResult.success) {
      return scanResult;
    }

    return this.selectReagentFromStock(scanResult.reagent_master_id, scanResult.quantity, scanResult.unit);
  }

  /**
   * 批量扫描试剂
   * @param {array} qrCodes - QR码数据数组
   * @returns {array} - 试剂信息数组
   */
  batchScan(qrCodes) {
    const results = [];
    
    for (const qrCode of qrCodes) {
      const result = this.scanAndSelectReagent(qrCode);
      results.push(result);
    }

    return {
      success: results.filter(r => r.success).length > 0,
      results,
      scanned_count: results.length,
      successful_count: results.filter(r => r.success).length
    };
  }

  /**
   * 检查库存充足性
   * @param {array} reagents - 试剂列表 [{reagent_master_id, quantity, unit}]
   * @returns {object} - 检查结果
   */
  checkStockAvailability(reagents) {
    const availabilityResults = [];
    const warnings = [];

    for (const reagent of reagents) {
      const selectionResult = this.selectReagentFromStock(reagent.reagent_master_id, reagent.quantity, reagent.unit);
      
      if (!selectionResult.success) {
        availabilityResults.push({
          reagent_master_id: reagent.reagent_master_id,
          reagent_name: reagent.reagent_name,
          quantity: reagent.quantity,
          unit: reagent.unit,
          available: false,
          error: selectionResult.error
        });
      } else {
        availabilityResults.push({
          reagent_master_id: reagent.reagent_master_id,
          reagent_name: selectionResult.reagent_name,
          quantity: reagent.quantity,
          unit: reagent.unit,
          available: true,
          remaining: selectionResult.remaining,
          expiration_date: selectionResult.expiration_date
        });

        if (selectionResult.remaining < selectionResult.min_quantity) {
          warnings.push({
            reagent_master_id: reagent.reagent_master_id,
            reagent_name: selectionResult.reagent_name,
            current: selectionResult.current_quantity,
            deduction: reagent.quantity,
            remaining: selectionResult.remaining,
            min_quantity: selectionResult.min_quantity,
            warning: '扣减后将低于最小库存'
          });
        }
      }
    }

    return {
      allAvailable: availabilityResults.every(item => item.available),
      availabilityResults,
      warnings
    };
  }
}

module.exports = QRScanner;