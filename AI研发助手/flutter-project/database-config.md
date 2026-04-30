# 数据库配置指南

## Drift数据库配置

### database.dart
```dart
import 'package:drift/drift.dart';
import 'package:drift/native.dart';

@DriftDatabase(tables: [GoodsIn, Inventory])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());
  
  @override
  int get schemaVersion => 1;
}

class GoodsIn extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get goodsName => text()();
  IntColumn get quantity => integer()();
  RealColumn get price => real()();
  TextColumn get arrivalDate => text()();
  TextColumn get supplier => text()();
  TextColumn get notes => text()();
  TextColumn get storageLocation => text().nullable()();
  TextColumn get qrcodeData => text().nullable()();
}

class Inventory extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get goodsId => integer()();
  TextColumn get goodsName => text()();
  IntColumn get currentQuantity => integer()();
  IntColumn get minQuantity => integer()();
  IntColumn get maxQuantity => integer()();
  TextColumn get location => text().nullable()();
  TextColumn get lastUpdate => text()();
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'desktop_pet.db'));
    
    return NativeDatabase(file);
  });
}
```

## SQLite优化配置

### database_service.dart
```dart
class DatabaseService {
  final AppDatabase _db;
  
  DatabaseService() {
    _db = AppDatabase();
  }
  
  // 入库商品
  Future<void> insertGoods(String goodsName, int quantity, 
      double price, String supplier, String notes, String qrcode) {
    return _db.transaction(() async {
      await _db.goodsIn.insertOne(
        GoodsInCompanion.insert(
          goodsName: goodsName,
          quantity: quantity,
          price: Value(price),
          arrivalDate: DateTime.now().toString(),
          supplier: supplier,
          notes: notes,
          qrcodeData: Value(qrcode),
          storageLocation: Value(null),
        ),
      );
      
      // 更新库存
      await updateInventory(goodsName, quantity);
    });
  }
  
  // 更新库存
  Future<void> updateInventory(String goodsName, int quantity) {
    return _db.transaction(() async {
      final existing = await _db.inventory.select()
        .where((tbl) => tbl.goodsName.equals(goodsName))
        .getSingleOrNull();
      
      if (existing != null) {
        await _db.inventory.updateWhere(
          (tbl) => tbl.goodsName.equals(goodsName),
          InventoryCompanion(
            currentQuantity: Value(existing.currentQuantity + quantity),
            lastUpdate: Value(DateTime.now().toString()),
          ),
        );
      } else {
        await _db.inventory.insertOne(
          InventoryCompanion.insert(
            goodsId: 1,
            goodsName: goodsName,
            currentQuantity: quantity,
            minQuantity: 10,
            maxQuantity: 1000,
            location: Value(null),
            lastUpdate: DateTime.now().toString(),
          ),
        );
      }
    });
  }
  
  // 查询空位置商品
  Stream<List<GoodsInData>> getEmptyLocationGoods() {
    return _db.goodsIn.select()
      .where((tbl) => tbl.storageLocation.isNull())
      .watch();
  }
}
```

## CRDT同步算法

### sync_engine.dart
```dart
class SyncEngine {
  final WebSocketChannel _channel;
  final DatabaseService _db;
  
  SyncEngine(DatabaseService db) {
    _db = db;
    _channel = WebSocketChannel.connect(
      Uri.parse('ws://localhost:8080/sync'),
    );
  }
  
  // CRDT数据结构
  class CRDTData {
    final String id;
    final Map<String, dynamic> data;
    final List<SyncOperation> operations;
    final DateTime timestamp;
  }
  
  class SyncOperation {
    final String operationId;
    final String type;
    final dynamic payload;
    final DateTime timestamp;
  }
  
  // 同步逻辑
  Future<void> syncData() async {
    final localData = await _db.getChangesSince(DateTime.now().subtract(Duration(minutes: 5)));
    
    // 发送本地变更
    await _channel.sink.add(json.encode({
      'type': 'push',
      'data': localData,
      'timestamp': DateTime.now().toIso8601String(),
    }));
    
    // 接收远程变更
    _channel.stream.listen((message) {
      final remoteData = json.decode(message);
      
      if (remoteData['type'] == 'pull') {
        applyRemoteChanges(remoteData['data']);
      }
    });
  }
  
  Future<void> applyRemoteChanges(List<dynamic> changes) async {
    for (final change in changes) {
      await _db.applyCRDTChange(change);
    }
  }
}
```

## WebSocket配置

### websocket_service.dart
```dart
class WebSocketService {
  WebSocketChannel? _channel;
  
  Future<void> connect() async {
    try {
      _channel = WebSocketChannel.connect(
        Uri.parse('ws://localhost:8080/ws'),
      );
      
      // 连接成功
      _channel!.stream.listen(
        (message) => handleMessage(message),
        onDone: () => reconnect(),
        onError: (error) => reconnect(),
      );
    } catch (e) {
      await reconnect();
    }
  }
  
  Future<void> reconnect() async {
    await Future.delayed(Duration(seconds: 5));
    connect();
  }
  
  void handleMessage(String message) {
    final data = json.decode(message);
    
    switch (data['type']) {
      case 'goods_in':
        // 处理入库数据
        handleGoodsIn(data['payload']);
        break;
      case 'location_update':
        // 处理位置更新
        handleLocationUpdate(data['payload']);
        break;
      case 'sync_request':
        // 处理同步请求
        handleSyncRequest(data['payload']);
        break;
    }
  }
}
```

## 定时监控器

### monitor_service.dart
```dart
class MonitorService {
  final DatabaseService _db;
  Timer? _timer;
  
  MonitorService(DatabaseService db) {
    _db = db;
    startMonitoring();
  }
  
  void startMonitoring() {
    _timer = Timer.periodic(Duration(minutes: 5), (_) {
      checkEmptyLocations();
    });
  }
  
  Future<void> checkEmptyLocations() async {
    final emptyGoods = await _db.getEmptyLocationGoods();
    
    if (emptyGoods.isNotEmpty) {
      // 触发桌宠动画
      triggerPetAnimation();
      
      // 显示提醒气泡
      showReminderBubble(emptyGoods);
    }
  }
  
  void triggerPetAnimation() {
    // 桌宠震动动画
    // 触发Lottie动画
  }
  
  void showReminderBubble(List<GoodsInData> goods) {
    // 显示气泡提示
    final message = goods.map((g) => g.goodsName).join(', ');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('位置提醒'),
        content: Text('新到的${message}还没放好~'),
        actions: [
          TextButton(
            onPressed: () => recordLocation(goods),
            child: Text('记录位置'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('关闭'),
          ),
        ],
      ),
    );
  }
}
```