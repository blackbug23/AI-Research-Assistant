# Android 端配置指南

## 悬浮窗权限申请

### AndroidManifest.xml 配置
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:name="io.flutter.app.FlutterApplication"
        android:label="AI Desktop Pet"
        android:icon="@mipmap/ic_launcher">
        
        <!-- 允许绘制悬浮窗 -->
        <meta-data
            android:name="io.flutter.embedding.android.FlutterActivity"
            android:value="true" />
        
        <!-- 后台服务 -->
        <service
            android:name=".BackgroundSyncService"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="START_SYNC" />
            </intent-filter>
        </service>
        
        <!-- 接收器 -->
        <receiver
            android:name=".AutoStartReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>
```

## 后台服务配置

### BackgroundSyncService.java
```java
package com.example.ai_desktop_pet;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class BackgroundSyncService extends Service {
    private static final String TAG = "BackgroundSyncService";
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "BackgroundSyncService started");
        
        // 保持WebSocket连接
        startWebSocketSync();
        
        // 保持服务运行
        return START_STICKY;
    }
    
    private void startWebSocketSync() {
        // WebSocket连接实现
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
```

### AutoStartReceiver.java
```java
package com.example.ai_desktop_pet;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class AutoStartReceiver extends BroadcastReceiver {
    private static final String TAG = "AutoStartReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "AutoStartReceiver triggered");
        
        // 启动后台服务
        Intent serviceIntent = new Intent(context, BackgroundSyncService.class);
        context.startService(serviceIntent);
    }
}
```

## Flutter端悬浮窗管理

### main.dart中的Android配置
```dart
if (Platform.isAndroid) {
  // 请求悬浮窗权限
  Future<void> requestPermission() async {
    if (!await FlutterWindowManager.requestPermission()) {
      // 权限未授权，提示用户
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('悬浮窗权限'),
          content: Text('需要悬浮窗权限才能显示桌面宠物'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('OK'),
            ),
          ],
        ),
      );
    }
    
    // 设置窗口属性
    await FlutterWindowManager.setFlags();
  }
  
  requestPermission();
}
```

## Android小部件配置

### WidgetConfiguration.java
```java
package com.example.ai_desktop_pet;

import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.appwidget.AppWidgetManager;
import android.widget.RemoteViews;
import android.app.PendingIntent;

public class DesktopWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            // 创建小部件视图
            RemoteViews views = new RemoteViews(context.getPackageName(), "layout/widget_layout");
            
            // 设置点击事件
            Intent clickIntent = new Intent(context, FlutterActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT);
            
            views.setOnClickPendingIntent(R.id.widget_button, pendingIntent);
            
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
```

## 权限请求流程

### 权限请求步骤
1. 在 AndroidManifest.xml 中声明权限
2. 在首次启动时请求 SYSTEM_ALERT_WINDOW 权限
3. 如果权限被拒绝，提供手动启用指南
4. 启用后台服务和开机自启

### 权限检查代码
```kotlin
fun checkPermission(context: Context): Boolean {
    return Settings.canDrawOverlays(context)
}

fun requestPermission(context: Context) {
    val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}")
    )
    context.startActivity(intent)
}
```