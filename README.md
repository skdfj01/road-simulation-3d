# 道路模型可视化系统

基于Cesium的道路模型可视化系统，支持第一视角行驶模拟、接入交通仿真数据和实时视频监控。

## 功能特点

- 高精度道路三维模型加载与渲染
- 单车第一视角模拟
- 交通仿真数据接入接口
- 实时视频设备监控集成
- 高性能轻量化设计

## 系统要求

- 现代浏览器（推荐Chrome、Firefox、Edge最新版本）
- 支持WebGL 2.0
- 推荐8GB以上内存
- 独立显卡获得更佳性能

## 快速开始

1. 获取Cesium Ion密钥
   - 访问 [https://cesium.com/ion/](https://cesium.com/ion/) 注册账号
   - 创建密钥并替换`app.js`中的`YOUR_ACCESS_TOKEN_HERE`

2. 准备3D Tiles格式的道路模型
   - 使用Cesium Ion上传您的道路模型（支持多种格式）
   - 或使用第三方工具转换为3D Tiles格式
   - 替换`app.js`中的`YOUR_3D_TILES_URL`为您的模型URL

3. 添加车辆模型
   - 准备glTF/glb格式的车辆模型
   - 替换`app.js`中的`path/to/vehicle.glb`为您的车辆模型路径

4. 启动服务器
   ```
   # 使用Python简易HTTP服务器（示例）
   python -m http.server 8080
   ```

5. 浏览器访问
   ```
   http://localhost:8080
   ```

## 性能优化建议

1. 模型优化
   - 使用3D Tiles格式自带的LOD机制
   - 调整`maximumScreenSpaceError`参数平衡质量和性能
   - 使用纹理压缩减少内存占用

2. 代码优化
   - 减少不必要的渲染和计算
   - 使用事件节流减少频繁更新
   - 按需加载远处或不可见区域

3. 浏览器设置
   - 启用硬件加速
   - 关闭不必要的浏览器扩展

## 扩展接口说明

### 接入交通仿真数据

本系统提供WebSocket接口接收交通仿真数据：

```javascript
// 示例代码
const socket = new WebSocket('ws://your-simulation-server/ws');
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateTrafficSimulation(data);
};
```

数据格式要求：
```json
{
  "timestamp": 1679000000,
  "vehicles": [
    {"id": "v001", "position": [116.4074, 39.9042, 0], "heading": 45, "speed": 60},
    {"id": "v002", "position": [116.4084, 39.9052, 0], "heading": 90, "speed": 40}
  ]
}
```

### 接入视频监控

支持RTMP、HLS和WebRTC视频流：

```javascript
// 示例代码
function addVideoMonitor(name, url, position) {
    viewer.entities.add({
        name: name,
        position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
        billboard: {
            image: './images/camera-icon.png',
            width: 32,
            height: 32
        },
        video: {
            url: url,
            show: false
        }
    });
}
```

## 许可说明

- 本项目代码采用MIT许可
- Cesium库需遵循其[使用条款](https://cesium.com/legal/terms-of-service/)
- 实际使用中请确保遵守所有地图和图像数据的授权要求

## 问题反馈

如遇到问题，请通过以下方式反馈：
- GitHub Issues
- 电子邮件：your-email@example.com

## 开发团队

- 开发者姓名/组织
- 联系方式 