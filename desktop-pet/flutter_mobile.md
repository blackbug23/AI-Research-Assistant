# Flutter移动端实现方案

## 技术选型
- **Flutter**：跨平台移动端开发
- **sqflite**：SQLite数据库插件
- **provider**：状态管理
- **flutter_lottie**：动画支持

## 项目结构
```
lib/
├── main.dart              # 主入口
├── screens/
│   ├── pet_screen.dart    # 桌宠主界面
│   ├── db_screen.dart     # 数据库查看界面
├── services/
│   ├── db_service.dart    # 数据库服务
│   ├── sync_service.dart  # 同步服务
├── models/
│   ├── goods.dart         # 商品模型
│   ├── inventory.dart     # 库存模型
├── widgets/
│   ├── pet_widget.dart    # 桌宠组件
│   ├── bubble_widget.dart # 气泡组件
```

## 数据库设计（与桌面端一致）

### goods_in表
```sql
CREATE TABLE goods_in (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goods_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2),
    arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    supplier TEXT,
    notes TEXT
);
```

### inventory表
```sql
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

## 核心功能

### 1. 桌宠UI
- Lottie动画实现待机、点击反应
- 拖拽功能
- 气泡提示

### 2. 数据库操作
- 本地SQLite存储
- CRUD操作
- 数据同步（未来扩展）

### 3. 数据同步方案
- WebSocket实时同步
- CRDT冲突解决
- 离线同步机制

## 与桌面端的数据层统一

### 共享数据模型
```dart
class Goods {
  int id;
  String goodsName;
  int quantity;
  double price;
  DateTime arrivalDate;
  String supplier;
  String notes;
}

class Inventory {
  int id;
  int goodsId;
  String goodsName;
  int currentQuantity;
  int minQuantity;
  int maxQuantity;
  String location;
  DateTime lastUpdate;
}
```

### 数据同步策略
1. **离线优先**：本地SQLite作为主存储
2. **实时同步**：WebSocket保持状态同步
3. **冲突解决**：CRDT算法保证一致性

## 测试流程

### 实验室测试流程
1. **单元测试**：每个模块独立测试
2. **集成测试**：模块间交互测试
3. **性能测试**：SQLite性能优化
4. **同步测试**：多设备同步验证
5. **合规测试**：AI模型合规检查

## 项目经理职责

### 项目计划
1. **里程碑制定**：每周一个里程碑
2. **进度跟踪**：每日进度检查
3. **风险管理**：技术风险识别
4. **资源协调**：团队协作协调

### 验收标准
1. **功能验收**：所有功能点验证
2. **性能验收**：响应时间<500ms
3. **用户体验**：流畅、直观
4. **数据一致性**：同步无冲突

## 部署方案

### 桌面端部署
- Electron打包（Windows、Mac、Linux）
- 最小化安装包
- 托盘图标集成

### 移动端部署
- Flutter打包（iOS、Android）
- 应用商店发布
- 后台服务部署

## 团队协作流程

1. **每日例会**：进度同步、问题讨论
2. **代码审查**：Git分支管理、PR审查
3. **测试集成**：自动化测试集成
4. **文档同步**：技术文档更新
5. **用户反馈**：收集用户反馈、持续迭代