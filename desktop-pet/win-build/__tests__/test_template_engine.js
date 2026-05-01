// 模板引擎测试

const TemplateEngine = require('../src/template_engine.js');

describe('TemplateEngine', () => {
  let templateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
  });

  test('加载模板', () => {
    expect(templateEngine.template).toBeTruthy();
    expect(templateEngine.template.template).toBeTruthy();
  });

  test('填充模板和润色', async () => {
    const experimentData = {
      title: 'DNA提取实验',
      objective: '从细胞中提取DNA并进行纯化',
      principle: '利用DNA在盐溶液中的溶解特性进行分离',
      materials_json: [
        { name: '氯化钠', quantity: 5, unit: 'g' },
        { name: '乙醇', quantity: 10, unit: 'ml' }
      ],
      raw_procedures: '步骤1：准备样品；步骤2：加入试剂',
      raw_results: '观察到白色沉淀'
    };

    const result = await templateEngine.fillTemplateAndPolish(experimentData);
    
    expect(result.success).toBeTruthy();
    expect(result.eln_record).toBeTruthy();
    expect(result.eln_record.header).toBeTruthy();
    expect(result.eln_record.content).toBeTruthy();
    expect(result.metadata.llm_calls).toBe(3);
  });

  test('验证实验数据完整性', () => {
    const validData = {
      title: '实验名称',
      objective: '实验目的',
      materials_json: [{ name: '试剂', quantity: 1, unit: 'g' }],
      raw_procedures: '步骤',
      raw_results: '结果'
    };

    const invalidData = {
      title: '实验名称',
      objective: '',
      materials_json: []
    };

    const validResult = templateEngine.validateExperimentData(validData);
    const invalidResult = templateEngine.validateExperimentData(invalidData);

    expect(validResult.valid).toBe(true);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test('生成实验编号', () => {
    const code = templateEngine.generateExperimentCode();
    expect(code).toBeTruthy();
    expect(code.startsWith('ELN')).toBe(true);
  });

  test('格式化实验材料', () => {
    const materials = [
      { name: '氯化钠', quantity: 5, unit: 'g' },
      { name: '乙醇', quantity: 10, unit: 'ml' }
    ];

    const formatted = templateEngine.formatMaterials(materials);
    expect(formatted).toBeTruthy();
    expect(formatted.includes('氯化钠')).toBe(true);
    expect(formatted.includes('乙醇')).toBe(true);
  });

  test('生成物料清单', () => {
    const materials = [
      { name: '氯化钠', reagent_master_id: 1001, quantity: 5, unit: 'g' }
    ];

    const list = templateEngine.generateMaterialsList(materials);
    expect(list).toBeTruthy();
    expect(typeof list).toBe('string');
  });

  test('生成PDF文本', () => {
    const elnRecord = {
      header: {
        experiment_code: 'ELN20240101-001',
        experiment_title: 'DNA提取实验',
        date: '2024-01-01',
        operator: '张三',
        location: '实验室'
      },
      content: {
        objective: '提取DNA',
        principle: '盐析法',
        materials: '氯化钠 5g',
        procedures: '步骤1：准备样品',
        results: '观察到沉淀',
        conclusion: '实验成功'
      },
      footer: {
        materials_list: '[]',
        safety_notes: '注意事项',
        references: '参考文献'
      },
      metadata: {
        generation_date: '2024-01-01',
        materials_count: 1
      }
    };

    const pdfText = templateEngine.generatePDFText(elnRecord);
    expect(pdfText).toBeTruthy();
    expect(pdfText.includes('ELN20240101-001')).toBe(true);
    expect(pdfText.includes('DNA提取实验')).toBe(true);
  });
});