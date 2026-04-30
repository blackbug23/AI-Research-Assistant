# AI 模型配置指南

## LLM部署配置

### llm_service.dart
```dart
class LLMService {
  final Dio _dio;
  
  LLMService() {
    _dio = Dio();
  }
  
  Future<String> extractGoodsInfo(String qrcodeText) async {
    try {
      // 正则表达式提取商品信息
      final regex = RegExp(r'(商品|名称|品名):(.+)|数量:(.+)|价格:(.+)');
      final matches = regex.allMatches(qrcodeText);
      
      var goodsName = '';
      var quantity = 0;
      var price = 0.0;
      
      for (final match in matches) {
        if (match.group(2) != null) {
          goodsName = match.group(2)!;
        } else if (match.group(3) != null) {
          quantity = int.parse(match.group(3)!);
        } else if (match.group(4) != null) {
          price = double.parse(match.group(4)!);
        }
      }
      
      // 如果正则提取失败，使用LLM解析
      if (goodsName.isEmpty) {
        final llmResponse = await callLLM(qrcodeText);
        return parseLLMResult(llmResponse);
      }
      
      return json.encode({
        'goods_name': goodsName,
        'quantity': quantity,
        'price': price,
      });
    } catch (e) {
      return '';
    }
  }
  
  Future<String> callLLM(String text) async {
    final response = await _dio.post(
      'https://api.openai.com/v1/completions',
      options: Options(headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
      }),
      data: {
        'model': 'gpt-3.5-turbo',
        'prompt': '解析以下商品信息：${text}',
        'max_tokens': 100,
      },
    );
    
    return response.data['choices'][0]['text'];
  }
  
  String parseLLMResult(String result) {
    // 解析LLM返回的商品信息
    final pattern = RegExp(r'商品名称：(.*?)|数量：(.*?)|价格：(.*?)');
    final matches = pattern.allMatches(result);
    
    var goodsName = '';
    var quantity = 0;
    var price = 0.0;
    
    for (final match in matches) {
      if (match.group(1) != null) {
        goodsName = match.group(1)!;
      } else if (match.group(2) != null) {
        quantity = int.parse(match.group(2)!);
      } else if (match.group(3) != null) {
        price = double.parse(match.group(3)!);
      }
    }
    
    return json.encode({
      'goods_name': goodsName,
      'quantity': quantity,
      'price': price,
    });
  }
}
```

## NER实体识别

### ner_service.dart
```dart
class NERService {
  Future<Map<String, dynamic>> extractEntities(String text) async {
    // 命名实体识别：商品名称、数量、价格、供应商
    final entities = {
      'goods_name': '',
      'quantity': 0,
      'price': 0.0,
      'supplier': '',
      'notes': '',
    };
    
    // 提取商品名称
    final goodsPattern = RegExp(r'(品名|商品|产品):(.+)');
    final goodsMatch = goodsPattern.firstMatch(text);
    if (goodsMatch != null) {
      entities['goods_name'] = goodsMatch.group(2)!;
    }
    
    // 提取数量
    final quantityPattern = RegExp(r'(数量|件数|个数):(\d+)');
    final quantityMatch = quantityPattern.firstMatch(text);
    if (quantityMatch != null) {
      entities['quantity'] = int.parse(quantityMatch.group(2)!);
    }
    
    // 提取价格
    final pricePattern = RegExp(r'(价格|单价|金额):(\d+(\.\d+)?)');
    final priceMatch = pricePattern.firstMatch(text);
    if (priceMatch != null) {
      entities['price'] = double.parse(priceMatch.group(2)!);
    }
    
    // 提取供应商
    final supplierPattern = RegExp(r'(供应商|供货商|厂家):(.+)');
    final supplierMatch = supplierPattern.firstMatch(text);
    if (supplierMatch != null) {
      entities['supplier'] = supplierMatch.group(2)!;
    }
    
    return entities;
  }
  
  Future<List<String>> extractKeywords(String text) async {
    // 关键词提取：类别、规格、型号
    final keywords = [];
    
    // 提取类别
    final categoryPattern = RegExp(r'(类别|分类|类型):(.+)');
    final categoryMatch = categoryPattern.firstMatch(text);
    if (categoryMatch != null) {
      keywords.add('category:${categoryMatch.group(2)!}');
    }
    
    // 提取规格
    final specPattern = RegExp(r'(规格|型号|尺寸):(.+)');
    final specMatch = specPattern.firstMatch(text);
    if (specMatch != null) {
      keywords.add('specification:${specMatch.group(2)!}');
    }
    
    return keywords;
  }
}
```

## 合规性模型

### compliance_service.dart
```dart
class ComplianceService {
  Future<bool> checkCompliance(Map<String, dynamic> goodsData) async {
    // 合规性检查：价格、数量、供应商验证
    
    final violations = [];
    
    // 价格合规检查
    if (goodsData['price'] <= 0) {
      violations.add('价格不能为0');
    }
    
    // 数量合规检查
    if (goodsData['quantity'] <= 0) {
      violations.add('数量不能为0');
    }
    
    // 供应商合规检查
    if (goodsData['supplier']?.isEmpty ?? true) {
      violations.add('供应商信息缺失');
    }
    
    // 商品名称合规检查
    if (goodsData['goods_name']?.isEmpty ?? true) {
      violations.add('商品名称缺失');
    }
    
    return violations.isEmpty;
  }
  
  Future<Map<String, String>> getComplianceSuggestions(Map<String, dynamic> goodsData) async {
    final suggestions = {};
    
    // 价格建议
    if (goodsData['price'] <= 10) {
      suggestions['price'] = '价格过低，请确认';
    }
    
    // 数量建议
    if (goodsData['quantity'] > 1000) {
      suggestions['quantity'] = '数量过大，请确认';
    }
    
    // 供应商建议
    if (goodsData['supplier']?.length > 100) {
      suggestions['supplier'] = '供应商名称过长';
    }
    
    return suggestions;
  }
  
  Future<String> validateQRCode(String qrcodeText) async {
    // QR码合规性验证
    
    final regex = RegExp(r'^[A-Z0-9]+-\d{4}$'); // 简单验证格式
    
    if (!regex.hasMatch(qrcodeText)) {
      return 'QR码格式不正确';
    }
    
    // 检查QR码内容合规性
    final entities = await NERService().extractEntities(qrcodeText);
    final compliance = await checkCompliance(entities);
    
    if (!compliance) {
      return 'QR码内容不合规';
    }
    
    return '';
  }
}
```

## 二维码扫描服务

### qr_scanner.dart
```dart
class QRScannerService {
  // 桌面端使用JSQR
  Future<String> scanDesktop() async {
    // 模拟桌面端扫描
    return '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A';
  }
  
  // 移动端使用mobile_scanner
  Future<String> scanMobile() async {
    // 模拟移动端扫描
    return '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B';
  }
  
  Future<Map<String, dynamic>> scanQRCode() async {
    String scannedText;
    
    if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      scannedText = await scanDesktop();
    } else if (Platform.isAndroid || Platform.isIOS) {
      scannedText = await scanMobile();
    } else {
      scannedText = '';
    }
    
    // 使用NER提取信息
    final entities = await NERService().extractEntities(scannedText);
    
    // 合规性验证
    final complianceError = await ComplianceService().validateQRCode(scannedText);
    
    return {
      'scanned_text': scannedText,
      'entities': entities,
      'compliance_error': complianceError,
      'is_valid': complianceError.isEmpty,
    };
  }
}
```

## 语音输入服务

### speech_service.dart
```dart
class SpeechService {
  Future<String> recordLocationByVoice() async {
    // 本地Whisper模型或Web Speech API
    
    try {
      if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
        // Web Speech API
        return await webSpeechAPI();
      } else if (Platform.isAndroid || Platform.isIOS) {
        // Android/iOS语音输入
        return await mobileSpeechAPI();
      }
    } catch (e) {
      return '';
    }
    
    return '';
  }
  
  Future<String> webSpeechAPI() async {
    // 模拟Web Speech API
    return '仓库A-货架3';
  }
  
  Future<String> mobileSpeechAPI() async {
    // 模拟移动端语音API
    return '仓库B-货架5';
  }
  
  Future<bool> updateLocationByVoice(int goodsId) async {
    final location = await recordLocationByVoice();
    
    if (location.isEmpty) {
      return false;
    }
    
    // 更新数据库
    return DatabaseService().updateGoodsLocation(goodsId, location);
  }
}
```

## AI集成配置

### ai_integration.dart
```dart
class AIIntegrationService {
  final QRScannerService _qrScanner;
  final NERService _nerService;
  final ComplianceService _complianceService;
  final LLMService _llmService;
  final SpeechService _speechService;
  final DatabaseService _dbService;
  
  AIIntegrationService() {
    _qrScanner = QRScannerService();
    _nerService = NERService();
    _complianceService = ComplianceService();
    _llmService = LLMService();
    _speechService = SpeechService();
    _dbService = DatabaseService();
  }
  
  // 完整的二维码处理流程
  Future<void> processQRCode() async {
    // 1. 扫描二维码
    final scanResult = await _qrScanner.scanQRCode();
    
    // 2. NER提取实体
    final entities = scanResult['entities'];
    
    // 3. 合规性验证
    final complianceResult = scanResult['is_valid'];
    
    if (!complianceResult) {
      // 不合规，触发提醒
      triggerComplianceAlert(scanResult['compliance_error']);
      return;
    }
    
    // 4. 入库数据
    final goodsName = entities['goods_name'];
    final quantity = entities['quantity'];
    final price = entities['price'];
    final supplier = entities['supplier'];
    
    // 5. 写入goods_in表（storage_location置空）
    await _dbService.insertGoods(goodsName, quantity, price, supplier, '', '');
    
    // 6. 触发后台监控
    MonitorService().startMonitoring();
  }
  
  // 位置录入流程
  Future<void> processLocationEntry(int goodsId) async {
    // 1. 语音输入位置
    final location = await _speechService.recordLocationByVoice();
    
    // 2. LLM优化位置描述
    final optimizedLocation = await _llmService.optimizeLocation(location);
    
    // 3. 更新storage_location字段
    await _dbService.updateGoodsLocation(goodsId, optimizedLocation);
  }
  
  void triggerComplianceAlert(String error) {
    // 显示合规性提醒
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('合规性警告'),
        content: Text(error),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('忽略'),
          ),
          TextButton(
            onPressed: () => processManualCorrection(),
            child: Text('手动修正'),
          ),
        ],
      ),
    );
  }
}
```