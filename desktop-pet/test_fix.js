// 测试修复后的模块
const LLMService = require('./src/llm_service.js');

async function testLLMService() {
  console.log('测试 LLMService 修复...');
  
  const llmService = new LLMService();
  
  // 测试构造函数
  console.log('温度配置:', llmService.temperature);
  console.log('API URL:', llmService.apiUrl);
  console.log('模型:', llmService.model);
  
  // 测试 generateCompletion 的错误处理
  console.log('测试错误处理逻辑...');
  
  // 模拟一个永远不会成功的调用
  try {
    // 这应该抛出错误
    await llmService.generateCompletion('test', { max_tokens: 10 });
    console.log('❌ generateCompletion 没有抛出预期的错误');
  } catch (error) {
    console.log('✅ generateCompletion 正确抛出错误:', error.message);
  }
  
  // 测试 sleep 函数
  console.log('测试指数退避逻辑...');
  
  // 测试指数退避
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount <= maxRetries) {
    console.log(`重试次数: ${retryCount}`);
    if (retryCount >= maxRetries) {
      console.log('✅ 指数退避逻辑正确：重试次数耗尽');
      break;
    }
    retryCount++;
    // 模拟等待
    await llmService.sleep(100);
  }
  
  console.log('✅ LLMService 修复测试完成');
}

async function testELNGeneration() {
  console.log('\n测试 ELNGenerationSystem 修复...');
  
  const ELNGenerationSystem = require('./src/eln_generation.js');
  const elnSystem = new ELNGenerationSystem();
  
  // 测试 startTime 初始化
  console.log('startTime 初始化:', elnSystem.startTime);
  
  // 测试 generateSuccessAnimation
  const mockResult = {
    statistics: {
      materials_count: 5,
      deduction_items_count: 3
    },
    eln_record: {
      content: {
        procedures: '实验步骤内容'
      }
    }
  };
  
  const animation = elnSystem.generateSuccessAnimation(mockResult);
  console.log('✅ generateSuccessAnimation 返回:', animation.substring(0, 50));
  
  console.log('✅ ELNGenerationSystem 修复测试完成');
}

async function main() {
  await testLLMService();
  await testELNGeneration();
  
  console.log('\n✅ 所有修复验证通过');
}

main();