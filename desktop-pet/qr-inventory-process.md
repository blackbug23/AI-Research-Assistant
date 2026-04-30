# QR码扫描入库系统 - 端到端流程

## 完整流程

### 1. QR码扫描
- **桌面端**: JSQR 库实现摄像头扫码
- **移动端**: Flutter mobile_scanner
- **正则提取**: 解析 QR 码内容，提取商品信息

### 2. 入库逻辑
- **写入 goods_in**: 商品信息入库
- **storage_location 置空**: 初始状态
- **更新 inventory**: 更新库存数据

### 3. 后台定时器
- **定时检查**: 每 5 分钟检查一次
- **监控空位置**: 查找 storage_location = NULL 的记录

### 4. 桌宠提醒
- **动画提醒**: 桌宠摇动动画
- **气泡提示**: "新到的XXX还没放好~"
- **快捷按钮**: "录入位置"按钮

### 5. 位置录入
- **语音输入**: Web Speech API 或本地 Whisper
- **手动输入**: 键盘输入
- **更新数据库**: 更新 storage_location 字段

## 代码架构

### 数据库结构
```javascript
// goods_in表
CREATE TABLE goods_in (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goods_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2),
  arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  supplier TEXT,
  notes TEXT,
  qrcode_data TEXT,
  storage_location TEXT DEFAULT NULL,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// inventory表
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goods_id INTEGER NOT NULL,
  goods_name TEXT NOT NULL,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER NOT NULL DEFAULT 1000,
  location TEXT,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### QR码解析逻辑
```javascript
// QR码正则解析
const regex = /(商品|名称|品名):(.+)|数量:(.+)|价格:(.+)|供应商:(.+)|备注:(.+)/i;
const matches = qrcodeData.match(regex);

let goods_name = '';
let quantity = 1;
let price = 0;
let supplier = '';
let notes = '';

if (matches) {
  if (matches[2]) goods_name = matches[2].trim();
  if (matches[3]) quantity = parseInt(matches[3]) || 1;
  if (matches[4]) price = parseFloat(matches[4]) || 0;
  if (matches[5]) supplier = matches[5].trim();
  if (matches[6]) notes = matches[6].trim();
} else {
  goods_name = qrcodeData;
}
```

### 后台定时器
```javascript
// 每5分钟检查一次
setInterval(() => {
  const records = getEmptyLocationRecords();
  
  if (records.success && records.count > 0) {
    // 触发桌宠动画
    triggerPetAnimation(records.data);
    
    // 显示气泡提醒
    showReminderBubble(records.data);
  }
}, 5 * 60 * 1000);
```

### 桌宠动画
```css
.shake-animation {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
```

### 气泡提醒
```html
<div id="reminder-bubble" class="reminder-bubble" style="display: none;">
  <div class="reminder-title">📢 位置提醒</div>
  <div id="reminder-content" class="reminder-content"></div>
  <div class="reminder-buttons">
    <button id="record-btn" class="reminder-btn">录入位置</button>
    <button id="ignore-btn" class="reminder-btn">忽略</button>
  </div>
</div>
```

### 语音录入
```javascript
// Web Speech API 语音识别
async function recognizeSpeech() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  
  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    return speechResult;
  };
  
  recognition.start();
}
```

## 测试用例

### QR码测试数据
```javascript
const testQRData = [
  '商品名称：笔记本电脑 数量：5 价格：2999.99 供应商：供应商A',
  '商品名称：鼠标 数量：100 价格：49.99 供应商：供应商B',
  '商品名称：键盘 数量：50 价格：129.99 供应商：供应商C',
  '商品名称：显示器 数量：20 价格：999.99 供应商：供应商D'
];
```

### 语音测试数据
```javascript
const testLocations = [
  '仓库A-货架1',
  '仓库B-货架3',
  '仓库C-货架5',
  '仓库D-货架7'
];
```

## 可交付物

### 1. 数据库
- goods_in表
- inventory表
- QR码解析逻辑
- 定时器监控
- 位置录入功能

### 2. 桌面宠物
- 透明窗口
- 可拖拽设计
- 动画效果
- 气泡提醒
- 语音录入

### 3. 业务流程
1. QR码扫描 → 入库 goods_in
2. storage_location = NULL
3. 定时器监控 → 触发提醒
4. 语音输入 → 更新 storage_location

## 运行方式

### Electron 启动
```bash
npm install
npm start
```

### 功能测试
1. **QR码扫描**: 点击"扫描QR码"按钮
2. **入库检查**: 自动入库 goods_in
3. **定时提醒**: 每5分钟自动检查
4. **位置录入**: 点击"录入位置"按钮
5. **语音测试**: "模拟语音输入"

## 监控日志

### 正常流程
1. QR码扫描 → goods_name, quantity, supplier
2. goods_in入库 → storage_location = NULL
3. 定时器发现 → storage_location = NULL 的商品
4. 触发提醒 → 桌宠动画 + 气泡
5. 位置录入 → 语音输入或手动输入
6. 更新数据库 → storage_location = "仓库A-货架1"

### 异常处理
1. QR码解析失败 → 使用原始文本
2. 数据库错误 → 日志记录
3. 定时器错误 → 容错机制
4. 语音识别失败 → 备用键盘输入