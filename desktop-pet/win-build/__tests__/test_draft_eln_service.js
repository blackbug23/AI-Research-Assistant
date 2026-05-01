// DraftELNService 测试

const DraftELNService = require('../src/draft_eln_service.js');

describe('DraftELNService', () => {
  let draftService;

  beforeEach(() => {
    draftService = new DraftELNService();
  });

  test('草稿服务构造函数', () => {
    expect(draftService.draftsFilePath).toBeTruthy();
    expect(draftService.drafts).toBeDefined();
  });

  test('创建实验记录草稿', () => {
    const draftData = {
      title: 'DNA提取实验',
      objective: '从细胞中提取DNA',
      principle: '盐析法',
      materials_json: [
        { reagent_master_id: 1001, name: '氯化钠', quantity: 5, unit: 'g' },
        { reagent_master_id: 1002, name: '乙醇', quantity: 10, unit: 'ml' }
      ],
      raw_procedures: '步骤1：准备样品',
      raw_results: '获得DNA'
    };

    const result = draftService.createDraft(draftData);
    
    expect(result.success).toBe(true);
    expect(result.draft).toBeDefined();
    expect(result.draft.id).toBe(1);
    expect(result.draft.title).toBe('DNA提取实验');
    expect(result.draft.status).toBe('draft');
  });

  test('草稿必需字段验证', () => {
    const draftData = {
      title: '',
      objective: '',
      materials_json: []
    };

    const result = draftService.createDraft(draftData);
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(3);
    expect(result.errors[0]).toBe('实验名称不能为空');
    expect(result.errors[1]).toBe('实验目的不能为空');
    expect(result.errors[2]).toBe('实验材料不能为空');
  });

  test('更新实验记录草稿', () => {
    // 先创建草稿
    const draftData = {
      title: '初始实验',
      objective: '初始目的',
      materials_json: [{ name: '试剂', quantity: 1, unit: 'g' }],
      raw_procedures: '初始步骤',
      raw_results: '初始结果'
    };

    const createResult = draftService.createDraft(draftData);
    
    // 更新草稿
    const updateData = {
      title: '更新后的实验',
      objective: '更新的目的',
      principle: '更新的原理',
      raw_procedures: '更新的步骤',
      raw_results: '更新的结果'
    };

    const updateResult = draftService.updateDraft(createResult.draft.id, updateData);
    
    expect(updateResult.success).toBe(true);
    expect(updateResult.draft.title).toBe('更新后的实验');
    expect(updateResult.draft.objective).toBe('更新的目的');
    expect(updateResult.draft.updated_at).toBeDefined();
  });

  test('获取草稿列表', () => {
    const draftData = {
      title: '测试实验',
      objective: '测试目的',
      materials_json: [{ name: '试剂', quantity: 1, unit: 'g' }],
      raw_procedures: '测试步骤',
      raw_results: '测试结果'
    };

    draftService.createDraft(draftData);
    
    const drafts = draftService.getDrafts('all');
    expect(drafts.length).toBeGreaterThan(0);
    
    const draftDrafts = draftService.getDrafts('draft');
    expect(draftDrafts.length).toBeGreaterThan(0);
    expect(draftDrafts[0].status).toBe('draft');
  });

  test('获取单个草稿', () => {
    const draftData = {
      title: '特定实验',
      objective: '特定目的',
      materials_json: [{ name: '试剂', quantity: 1, unit: 'g' }],
      raw_procedures: '特定步骤',
      raw_results: '特定结果'
    };

    const createResult = draftService.createDraft(draftData);
    
    const draft = draftService.getDraftById(createResult.draft.id);
    
    expect(draft).toBeDefined();
    expect(draft.id).toBe(createResult.draft.id);
    expect(draft.title).toBe('特定实验');
  });

  test('删除草稿', () => {
    const draftData = {
      title: '待删除实验',
      objective: '待删除目的',
      materials_json: [{ name: '试剂', quantity: 1, unit: 'g' }],
      raw_procedures: '待删除步骤',
      raw_results: '待删除结果'
    };

    const createResult = draftService.createDraft(draftData);
    
    const deleteResult = draftService.deleteDraft(createResult.draft.id);
    
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.message).toBe('草稿删除成功');
    
    const draft = draftService.getDraftById(createResult.draft.id);
    expect(draft).toBeUndefined();
  });

  test('完成草稿', () => {
    const draftData = {
      title: '完成实验',
      objective: '完成目的',
      materials_json: [{ name: '试剂', quantity: 1, unit: 'g' }],
      raw_procedures: '完成步骤',
      raw_results: '完成结果'
    };

    const createResult = draftService.createDraft(draftData);
    
    const completeResult = draftService.completeDraft(createResult.draft.id);
    
    expect(completeResult.success).toBe(true);
    expect(completeResult.draft.status).toBe('completed');
  });

  test('模拟实验记录采集流程', () => {
    const stepData = {
      voice_input: '加入5g氯化钠',
      qr_scanned: '试剂QR码',
      stock_selected: { reagent_master_id: 1001, quantity: 5, unit: 'g' },
      image_path: '/path/to/image.png'
    };

    const result = draftService.simulateStepCollection(stepData);
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('步骤采集成功');
    expect(result.collected_data).toBe(stepData);
  });

  test('多步骤草稿采集', () => {
    const draftSteps = [
      { voice_input: '实验名称：DNA提取' },
      { voice_input: '实验原理：盐析法' },
      { qr_scanned: '氯化钠QR码' },
      { stock_selected: { reagent_master_id: 1002, quantity: 10, unit: 'ml' } },
      { voice_input: '加入乙醇沉淀DNA' },
      { image_path: '/path/to/result.png' }
    ];

    const result = draftService.multiStepCollection(draftSteps);
    
    expect(result.success).toBe(true);
    expect(result.collected_steps.length).toBe(6);
    expect(result.progress).toBe(100);
  });
});