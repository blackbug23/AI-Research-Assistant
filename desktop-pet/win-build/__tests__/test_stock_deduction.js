// 库存扣减引擎测试

const StockDeductionEngine = require('../src/stock_deduction.js');

describe('StockDeductionEngine', () => {
  let stockEngine;

  beforeEach(() => {
    stockEngine = new StockDeductionEngine(StockDeductionEngine.generateMockStockData());
  });

  test('库存扣减成功', () => {
    const deductionItems = [
      { reagent_master_id: 1001, reagent_name: '氯化钠', quantity: 100, unit: 'g' },
      { reagent_master_id: 1002, reagent_name: '乙醇', quantity: 50, unit: 'ml' }
    ];

    const result = stockEngine.deductStock(deductionItems, 1);
    
    expect(result.success).toBe(true);
    expect(result.deduction_logs.length).toBe(2);
    expect(result.deduction_logs[0].remaining).toBe(400); // 500-100=400
    expect(result.deduction_logs[1].remaining).toBe(950); // 1000-50=950
  });

  test('库存不足检查', () => {
    const deductionItems = [
      { reagent_master_id: 1001, reagent_name: '氯化钠', quantity: 1000, unit: 'g' }
    ];

    const result = stockEngine.deductStock(deductionItems, 1);
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('库存不足，扣减失败');
  });

  test('FEFO原则扣减', () => {
    const deductionItems = [
      { reagent_master_id: 1001, reagent_name: '氯化钠', quantity: 100, unit: 'g' }
    ];

    const result = stockEngine.deductStock(deductionItems, 1);
    
    // 应该使用有效期最早的库存
    expect(result.deduction_logs[0].remaining).toBe(400); // 500-100=400
  });

  test('库存充足性检查', () => {
    const deductionItems = [
      { reagent_master_id: 1001, reagent_name: '氯化钠', quantity: 100, unit: 'g' },
      { reagent_master_id: 1003, reagent_name: '硫酸', quantity: 500, unit: 'ml' } // 库存不足
    ];

    const result = stockEngine.checkStockAvailability(deductionItems);
    
    expect(result.allAvailable).toBe(false);
    expect(result.availabilityResult[0].available).toBe(true);
    expect(result.availabilityResult[1].available).toBe(false);
    expect(result.availabilityResult[1].reason).toBe('库存不足');
  });

  test('低于最小库存警告', () => {
    const deductionItems = [
      { reagent_master_id: 1001, reagent_name: '氯化钠', quantity: 450, unit: 'g' } // 500-450=50<min_quantity(50)
    ];

    const result = stockEngine.checkStockAvailability(deductionItems);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].warning).toBe('扣减后将低于最小库存');
  });

  test('事务回滚', () => {
    const deductionItems = [
      { reagent_master_id: 1001, reagent_name: '氯化钠', quantity: 100, unit: 'g' },
      { reagent_master_id: 1003, reagent_name: '硫酸', quantity: 500, unit: 'ml' } // 库存不足
    ];

    const result = stockEngine.deductStock(deductionItems, 1);
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    // 应该自动回滚，日志为空
    expect(stockEngine.stockLog.length).toBe(0);
  });

  test('生成扣减摘要', () => {
    const deductionLogs = [
      { reagent_name: '氯化钠', quantity: 100, unit: 'g', remaining: 400 },
      { reagent_name: '乙醇', quantity: 50, unit: 'ml', remaining: 950 }
    ];

    const summary = stockEngine.generateDeductionSummary(deductionLogs);
    
    expect(summary.includes('氯化钠')).toBe(true);
    expect(summary.includes('乙醇')).toBe(true);
    expect(summary.includes('库存扣减摘要')).toBe(true);
  });

  test('生成模拟库存数据', () => {
    const mockStock = StockDeductionEngine.generateMockStockData();
    
    expect(mockStock.length).toBeGreaterThan(0);
    expect(mockStock[0].reagent_master_id).toBe(1001);
    expect(mockStock[0].reagent_name).toBe('氯化钠');
    expect(mockStock[0].current_quantity).toBe(500);
  });
});