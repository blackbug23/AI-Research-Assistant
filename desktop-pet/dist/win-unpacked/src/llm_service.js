// LLM服务模块
// 调用Ollama API进行实验记录生成和润色

const axios = require('axios');

class LLMService {
  constructor() {
    this.apiUrl = process.env.LLM_API_URL || 'http://localhost:11434/api/generate';
    this.model = process.env.LLM_MODEL || 'llama2';
    // 从环境变量读取温度，默认为 0.3
    this.temperature = process.env.LLM_TEMPERATURE ? parseFloat(process.env.LLM_TEMPERATURE) : 0.3;
  }

  /**
   * 生成LLM完成文本（带指数退避重试）
   * @param {string} prompt - 输入提示
   * @param {object} options - 可选参数
   * @returns {Promise<string>} - LLM生成的文本
   */
  async generateCompletion(prompt, options = {}) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        const response = await axios.post(this.apiUrl, {
          model: this.model,
          prompt: prompt,
          stream: false,
          temperature: this.temperature,
          max_tokens: options.max_tokens || 2000,
          ...options
        }, {
          timeout: 30000
        });

        if (response.data && response.data.response) {
          return response.data.response;
        } else {
          throw new Error('LLM响应格式不正确');
        }
      } catch (error) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw new Error(`LLM调用失败：${error.message}`);
        }
        
        // 指数退避：1秒, 2秒, 4秒
        const waitTime = Math.pow(2, retryCount - 1) * 1000;
        console.log(`LLM调用失败，${waitTime}ms后重试...`);
        await this.sleep(waitTime);
      }
    }
    
    // 如果所有重试都失败
    throw new Error('LLM调用超时，重试次数耗尽');
  }

  /**
   * 润色实验步骤
   * @param {string} rawSteps - 原始实验步骤
   * @returns {Promise<string>} - 润色后的步骤
   */
  async polishExperimentSteps(rawSteps) {
    const prompt = `请润色以下实验步骤，保持原意不变，使其更加专业、清晰：
    
    原始步骤：${rawSteps}
    
    要求：
    1. 保持所有技术参数不变
    2. 不添加任何虚构步骤或试剂
    3. 保持逻辑顺序不变
    4. 使用专业术语
    5. 温度设置为0.3，仅润色文本
    
    润色后的步骤：`;
    
    return await this.generateCompletion(prompt);
  }

  /**
   * 润色实验结果
   * @param {string} rawResults - 原始实验结果
   * @returns {Promise<string>} - 润色后的结果
   */
  async polishExperimentResults(rawResults) {
    const prompt = `请润色以下实验结果描述，保持原意不变，使其更加专业、清晰：
    
    原始结果：${rawResults}
    
    要求：
    1. 保持所有数据和观察结果不变
    2. 不添加任何虚构内容
    3. 保持事实准确性
    4. 使用科学术语描述
    5. 温度设置为0.3，仅润色文本
    
    润色后的结果：`;
    
    return await this.generateCompletion(prompt);
  }

  /**
   * 生成实验记录
   * @param {object} experimentData - 实验数据
   * @returns {Promise<string>} - 完整的实验记录文本
   */
  async generateExperimentRecord(experimentData) {
    const prompt = `请基于以下实验数据生成完整的实验记录：
    
    实验名称：${experimentData.title || ''}
    实验目的：${experimentData.objective || ''}
    实验原理：${experimentData.principle || ''}
    实验材料：${JSON.stringify(experimentData.materials || [], null, 2)}
    实验步骤：${experimentData.procedures_raw || ''}
    实验结果：${experimentData.results_raw || ''}
    
    要求：
    1. 仅使用提供的输入信息，不添加任何虚构数据
    2. 保持结构：标题、目的、原理、材料、步骤、结果、结论、物料清单
    3. 文字专业、清晰、准确
    4. 温度设置为0.3，严格遵循事实
    
    完整的实验记录：`;
    
    return await this.generateCompletion(prompt, { max_tokens: 3000 });
  }

  /**
   * 暂停函数（用于指数退避）
   * @param {number} ms - 毫秒数
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 测试LLM连接
   * @returns {Promise<boolean>} - 是否连接成功
   */
  async testConnection() {
    try {
      const testPrompt = '你好';
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        prompt: testPrompt,
        stream: false,
        temperature: this.temperature,
        max_tokens: 10
      }, {
        timeout: 10000
      });

      return response.data && response.data.response;
    } catch (error) {
      console.error('LLM连接测试失败:', error.message);
      return false;
    }
  }
}

module.exports = LLMService;