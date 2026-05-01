// LLM服务测试

const LLMService = require('../src/llm_service.js');

describe('LLMService', () => {
  let llmService;

  beforeEach(() => {
    llmService = new LLMService();
  });

  test('LLM服务构造函数', () => {
    expect(llmService.apiUrl).toBe(process.env.LLM_API_URL || 'http://localhost:11434/api/generate');
    expect(llmService.model).toBe(process.env.LLM_MODEL || 'llama2');
    expect(llmService.temperature).toBe(0.3);
  });

  test('generateCompletion指数退避', async () => {
    // 模拟调用失败，验证指数退避
    jest.spyOn(llmService, 'sleep').mockImplementation(() => Promise.resolve());
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('网络错误'));

    try {
      await llmService.generateCompletion('测试');
    } catch (error) {
      expect(error.message).toContain('LLM调用失败');
      expect(llmService.sleep).toHaveBeenCalledTimes(2); // 重试2次
    }
  });

  test('润色实验步骤', async () => {
    const rawSteps = '步骤1：加入试剂；步骤2：搅拌；步骤3：离心';
    const polishedSteps = await llmService.polishExperimentSteps(rawSteps);
    
    expect(polishedSteps).toBeTruthy();
    expect(polishedSteps.length).toBeGreaterThan(rawSteps.length);
  });

  test('润色实验结果', async () => {
    const rawResults = '观察到白色沉淀，pH值为7.2';
    const polishedResults = await llmService.polishExperimentResults(rawResults);
    
    expect(polishedResults).toBeTruthy();
    expect(polishedResults.length).toBeGreaterThan(rawResults.length);
  });

  test('生成实验记录', async () => {
    const experimentData = {
      title: 'DNA提取实验',
      objective: '提取DNA',
      principle: '盐析法',
      materials: [{ name: '氯化钠', quantity: 5, unit: 'g' }],
      procedures_raw: '步骤1：准备样品',
      results_raw: '获得DNA'
    };
    
    const record = await llmService.generateExperimentRecord(experimentData);
    
    expect(record).toBeTruthy();
    expect(record.length).toBeGreaterThan(100);
  });

  test('测试连接', async () => {
    const connected = await llmService.testConnection();
    expect(connected).toBeTruthy();
  });
});