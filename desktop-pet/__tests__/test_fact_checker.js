// 事实核对模块测试

const FactChecker = require('../src/fact_checker.js');

describe('FactChecker', () => {
  let factChecker;

  beforeEach(() => {
    factChecker = new FactChecker();
  });

  test('试剂名称匹配', () => {
    expect(factChecker.matchReagentNames('氯化钠', 'NaCl')).toBe(true);
    expect(factChecker.matchReagentNames('乙醇', '酒精')).toBe(true);
    expect(factChecker.matchReagentNames('氢氧化钠', 'NaOH')).toBe(true);
    expect(factChecker.matchReagentNames('硫酸', 'H2SO4')).toBe(true);
  });

  test从文本中提取试剂', () => {
    const text = '加入5克氯化钠和10毫升乙醇';
    const reagents = factChecker.extractReagentsFromText(text);
    
    expect(reagents.length).toBe(2);
    expect(reagents[0].name).toBe('氯化钠');
    expect(reagents[0].quantity).toBe(5);
    expect(reagents[0].unit).toBe('克');
    expect(reagents[1].name).toBe('乙醇');
    expect(reagents[1].quantity).toBe(10);
    expect(reagents[1].unit).toBe('毫升');
  });

  test('核对试剂一致性', () => {
    const llmOutput = '实验中使用氯化钠5克和乙醇10毫升';
    const originalMaterials = [
      { name: '氯化钠', quantity: 5, unit: 'g' },
      { name: '乙醇', quantity: 10, unit: 'ml' }
    ];

    const result = factChecker.checkMaterialConsistency(llmOutput, originalMaterials);
    
    expect(result.consistent).toBe(true);
    expect(result.inconsistencies.length).toBe(0);
    expect(result.unknownReagents.length).toBe(0);
    expect(result.extractedReagents.length).toBe(2);
  });

  test('用量偏差超过容忍度', () => {
    const llmOutput = '实验中使用氯化钠6克和乙醇10毫升';
    const originalMaterials = [
      { name: '氯化钠', quantity: 5, unit: 'g' },
      { name: '乙醇', quantity: 10, unit: 'ml' }
    ];

    const result = factChecker.checkMaterialConsistency(llmOutput, originalMaterials);
    
    expect(result.consistent).toBe(false);
    expect(result.inconsistencies.length).toBe(1);
    expect(result.inconsistencies[0].reagent_name).toBe('氯化钠');
    expect(result.inconsistencies[0].difference).toBe(1);
    expect(result.inconsistencies[0].ratio).toBe(20);
  });

  test('LLM遗漏试剂', () => {
    const llmOutput = '实验中使用氯化钠5克';
    const originalMaterials = [
      { name: '氯化钠', quantity: 5, unit: 'g' },
      { name: '乙醇', quantity: 10, unit: 'ml' }
    ];

    const result = factChecker.checkMaterialConsistency(llmOutput, originalMaterials);
    
    expect(result.consistent).toBe(false);
    expect(result.inconsistencies.length).toBe(1);
    expect(result.inconsistencies[0].reagent_name).toBe('乙醇');
    expect(result.inconsistencies[0].reason).toBe('LLM输出中遗漏此试剂');
  });

  test('LLM添加虚构试剂', () => {
    const llmOutput = '实验中使用氯化钠5克和盐酸3毫升';
    const originalMaterials = [
      { name: '氯化钠', quantity: 5, unit: 'g' }
    ];

    const result = factChecker.checkMaterialConsistency(llmOutput, originalMaterials);
    
    expect(result.consistent).toBe(false);
    expect(result.unknownReagents.length).toBe(1);
    expect(result.unknownReagents[0].reagent_name).toBe('盐酸');
  });

  test('数值一致性验证', () => {
    expect(factChecker.validateNumericConsistency(5, 5.4)).toBe(true);
    expect(factChecker.validateNumericConsistency(5, 5.6)).toBe(false);
    expect(factChecker.validateNumericConsistency(10, 9)).toBe(true);
    expect(factChecker.validateNumericConsistency(10, 8)).toBe(false);
  });

  test('生成核对报告', () => {
    const result = {
      consistent: false,
      inconsistencies: [
        {
          reagent_name: '氯化钠',
          original_quantity: 5,
          original_unit: 'g',
          llm_quantity: 6,
          llm_unit: 'g',
          difference: 1,
          ratio: 20,
          reason: '用量偏差超过10%'
        }
      ],
      unknownReagents: [],
      extractedReagents: [
        { name: '氯化钠', quantity: 6, unit: 'g' }
      ],
      originalMaterials: [
        { name: '氯化钠', quantity: 5, unit: 'g' }
      ]
    };

    const report = factChecker.generateReport(result);
    
    expect(report.includes('LLM输出与原始物料存在不一致')).toBe(true);
    expect(report.includes('氯化钠')).toBe(true);
    expect(report.includes('用量偏差')).toBe(true);
  });

  test('批量核对', () => {
    const llmOutputs = [
      '使用氯化钠5克',
      '使用乙醇10毫升'
    ];
    const originalMaterials = [
      { name: '氯化钠', quantity: 5, unit: 'g' },
      { name: '乙醇', quantity: 10, unit: 'ml' }
    ];

    const batchResults = factChecker.batchCheck(llmOutputs, originalMaterials);
    
    expect(batchResults.length).toBe(2);
    expect(batchResults[0].consistent).toBe(true);
    expect(batchResults[1].consistent).toBe(true);
  });
});