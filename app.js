// 设置Cesium Ion访问令牌
// 这是一个开发测试令牌，您应该在cesium.com注册并获取自己的令牌
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTdlZjI0YS0zMzYzLTQwMzgtYmFhZi0xNGRkZTM0ZTYzMDEiLCJpZCI6MTc5MDE5LCJpYXQiOjE2OTg5OTgyOTh9.QpZgc9-XFjkUKBh6dIEZ4lz9YAOPg5KQb49vGFFMOBs';

// 初始化Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain(),
    animation: false,        // 是否显示动画控件
    baseLayerPicker: true,   // 是否显示图层选择控件
    fullscreenButton: true,  // 是否显示全屏按钮
    geocoder: false,         // 是否显示地名查找控件
    homeButton: true,        // 是否显示Home按钮
    infoBox: true,           // 是否显示信息框
    sceneModePicker: true,   // 是否显示3D/2D选择器
    selectionIndicator: true,// 是否显示选取指示器
    timeline: false,         // 是否显示时间线控件
    navigationHelpButton: true, // 是否显示帮助按钮
    scene3DOnly: true,      // 只显示3D视图以提升性能
    shadows: false,         // 关闭阴影
    shouldAnimate: true,    // 是否自动播放动画
    terrainShadows: Cesium.ShadowMode.DISABLED // 禁用地形阴影
});

// 关闭不必要的默认部件
viewer.cesiumWidget.creditContainer.style.display = "none"; // 隐藏版权信息

// 创建坐标信息显示元素
const coordInfoDiv = document.createElement('div');
coordInfoDiv.style.position = 'absolute';
coordInfoDiv.style.bottom = '10px';
coordInfoDiv.style.left = '10px';
coordInfoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
coordInfoDiv.style.color = 'white';
coordInfoDiv.style.padding = '10px';
coordInfoDiv.style.borderRadius = '5px';
coordInfoDiv.style.fontSize = '14px';
coordInfoDiv.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(coordInfoDiv);

// 存储选择的路线点
let selectedPoints = [];

// 获取鼠标位置的地理坐标
function getMousePosition(e) {
    const rect = viewer.scene.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 获取鼠标点击的笛卡尔坐标
    const cartesian = viewer.scene.pickPosition(new Cesium.Cartesian2(x, y));
    
    // 如果pickPosition失败，尝试使用globe.pick
    if (!cartesian) {
        const ray = viewer.camera.getPickRay(new Cesium.Cartesian2(x, y));
        if (ray) {
            return viewer.scene.globe.pick(ray, viewer.scene);
        }
        return null;
    }
    
    return cartesian;
}

// 添加鼠标移动事件处理
viewer.scene.canvas.addEventListener('mousemove', function(e) {
    const position = getMousePosition(e);
    if (position) {
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;
        
        // 确保高度值合理
        const adjustedHeight = height < 0 ? 0 : height;
        
        coordInfoDiv.innerHTML = `
            经度: ${longitude.toFixed(6)}<br>
            纬度: ${latitude.toFixed(6)}<br>
            高度: ${adjustedHeight.toFixed(2)}米
        `;
    } else {
        coordInfoDiv.innerHTML = '正在获取坐标...';
    }
});

// 创建控制按钮容器
const controlPanel = document.createElement('div');
controlPanel.style.position = 'absolute';
controlPanel.style.top = '10px';
controlPanel.style.right = '10px';
controlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
controlPanel.style.padding = '10px';
controlPanel.style.borderRadius = '5px';
document.body.appendChild(controlPanel);

// 创建清除按钮
const clearButton = document.createElement('button');
clearButton.textContent = '清除路线';
clearButton.style.display = 'block';
clearButton.style.marginBottom = '5px';
clearButton.style.padding = '8px 15px';
clearButton.style.backgroundColor = '#ff4444';
clearButton.style.color = 'white';
clearButton.style.border = 'none';
clearButton.style.borderRadius = '3px';
clearButton.style.cursor = 'pointer';
controlPanel.appendChild(clearButton);

// 创建确认路线按钮
const confirmRouteButton = document.createElement('button');
confirmRouteButton.textContent = '确认路线';
confirmRouteButton.style.display = 'block';
confirmRouteButton.style.marginBottom = '5px';
confirmRouteButton.style.padding = '8px 15px';
confirmRouteButton.style.backgroundColor = '#44ff44';
confirmRouteButton.style.color = 'black';
confirmRouteButton.style.border = 'none';
confirmRouteButton.style.borderRadius = '3px';
confirmRouteButton.style.cursor = 'pointer';
controlPanel.appendChild(confirmRouteButton);

// 创建开始行驶按钮（初始隐藏）
const startDriveButton = document.createElement('button');
startDriveButton.textContent = '开始行驶';
startDriveButton.style.display = 'none';
startDriveButton.style.marginBottom = '5px';
startDriveButton.style.padding = '8px 15px';
startDriveButton.style.backgroundColor = '#4444ff';
startDriveButton.style.color = 'white';
startDriveButton.style.border = 'none';
startDriveButton.style.borderRadius = '3px';
startDriveButton.style.cursor = 'pointer';
controlPanel.appendChild(startDriveButton);

// 创建停止行驶按钮（初始隐藏）
const stopDriveButton = document.createElement('button');
stopDriveButton.textContent = '停止行驶';
stopDriveButton.style.display = 'none';
stopDriveButton.style.marginBottom = '5px';
stopDriveButton.style.padding = '8px 15px';
stopDriveButton.style.backgroundColor = '#ff8844';
stopDriveButton.style.color = 'white';
stopDriveButton.style.border = 'none';
stopDriveButton.style.borderRadius = '3px';
stopDriveButton.style.cursor = 'pointer';
controlPanel.appendChild(stopDriveButton);

// 添加鼠标悬停效果
[clearButton, confirmRouteButton, startDriveButton, stopDriveButton].forEach(button => {
    button.addEventListener('mouseover', function() {
        this.style.opacity = '0.8';
    });
    button.addEventListener('mouseout', function() {
        this.style.opacity = '1';
    });
});

let isRouteConfirmed = false;
let confirmedRoute = [];

// 清除路线功能
function clearRoute() {
    selectedPoints = [];
    confirmedRoute = [];
    isRouteConfirmed = false;
    viewer.entities.removeAll();
    startDriveButton.style.display = 'none';
    stopDriveButton.style.display = 'none';
    confirmRouteButton.style.display = 'block';
    stopVehicleSimulation();
}

// 确认路线功能
function confirmRoute() {
    if (selectedPoints.length >= 2) {
        confirmedRoute = [...selectedPoints];
        isRouteConfirmed = true;
        confirmRouteButton.style.display = 'none';
        startDriveButton.style.display = 'block';
        stopDriveButton.style.display = 'block';
    } else {
        alert('请至少选择两个路线点！');
    }
}

// 开始行驶功能
function startDrive() {
    if (isRouteConfirmed && confirmedRoute.length >= 2) {
        setCustomRoute(confirmedRoute);
        startVehicleSimulation();
    }
}

// 停止行驶功能
function stopDrive() {
    stopVehicleSimulation();
}

// 修改初始化事件监听函数
function setupEventListeners() {
    clearButton.addEventListener('click', clearRoute);
    confirmRouteButton.addEventListener('click', confirmRoute);
    startDriveButton.addEventListener('click', startDrive);
    stopDriveButton.addEventListener('click', stopDrive);
    document.getElementById('firstPersonView').addEventListener('click', enableFirstPersonView);
    document.getElementById('topView').addEventListener('click', enableTopView);
}

// 修改点击事件处理，只在按住Ctrl键且路线未确认时允许添加点
viewer.scene.canvas.addEventListener('click', function(e) {
    // 检查是否按住Ctrl键
    if (!e.ctrlKey) return; // 如果没有按住Ctrl键，直接返回
    if (isRouteConfirmed) return; // 如果路线已确认，不允许添加新点
    
    const position = getMousePosition(e);
    if (position) {
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = Math.max(0, cartographic.height);
        
        addPointMarker(longitude, latitude, height);
        
        selectedPoints.push({
            lon: longitude,
            lat: latitude,
            height: height
        });
        
        console.log(`添加路线点: 经度=${longitude}, 纬度=${latitude}, 高度=${height}`);
    }
});

// 添加点标记
function addPointMarker(longitude, latitude, height) {
    const point = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        point: {
            pixelSize: 10,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
            text: `点 ${selectedPoints.length + 1}`,
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10)
        }
    });
}

// 清除所有选择的点
function clearSelectedPoints() {
    selectedPoints = [];
    viewer.entities.removeAll();
}

// 路径常量定义
const MODELS_ROOT_PATH = './models/converted/';
const BLOCKS = [
    'BlockBB',
    'BlockBY',
    'BlockYB',
    'BlockYY'
];

// 初始化场景
function initScene() {
    // 设置初始视角（这个位置需要调整为适合您模型的位置）
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(116.4074, 39.9042, 1000), // 默认位置(稍后会被自动调整)
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0.0
        }
    });
    
    // 添加地形
    viewer.terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true
    });
}

// 加载道路模型
function loadRoadModel() {
    try {
        // 存储所有模型的加载Promise
        const tilesetPromises = [];
        
        // 加载所有Block模型
        for (const block of BLOCKS) {
            const tilesetUrl = `${MODELS_ROOT_PATH}${block}/tileset.json`;
            console.log(`加载模型: ${tilesetUrl}`);
            
            const tileset = new Cesium.Cesium3DTileset({
                url: tilesetUrl,
                maximumScreenSpaceError: 2, // 数值越小，模型越精细，但性能开销越大
                maximumMemoryUsage: 1024,    // 内存使用限制(MB)
                debugShowBoundingVolume: false, // 调试时可以设为true，显示边界
                debugWireframe: false          // 调试时可以设为true，显示线框
            });
            
            // 添加到场景中
            const tilesetInScene = viewer.scene.primitives.add(tileset);
            
            // 将promise添加到数组
            tilesetPromises.push(tileset.readyPromise);
        }
        
        // 当所有模型加载完成后
        Promise.all(tilesetPromises).then(function(tilesets) {
            console.log("所有道路模型加载完成");
            
            // 计算所有模型的边界球
            const boundingSpheres = tilesets.map(tileset => tileset.boundingSphere);
            let combinedBoundingSphere = boundingSpheres[0];
            
            // 合并所有边界球
            for (let i = 1; i < boundingSpheres.length; i++) {
                combinedBoundingSphere = Cesium.BoundingSphere.union(
                    combinedBoundingSphere, 
                    boundingSpheres[i]
                );
            }
            
            // 计算视角位置，以便完整查看模型
            const offset = new Cesium.HeadingPitchRange(
                0,
                -0.5,
                combinedBoundingSphere.radius * 2.0
            );
            
            // 移动相机到模型上方
            viewer.camera.viewBoundingSphere(combinedBoundingSphere, offset);
            
            // 创建车辆并放置在合适的位置
            createVehicle(combinedBoundingSphere.center);
            
        }).catch(function(error) {
            console.log("加载3D Tiles模型时出错:", error);
        });
    } catch (e) {
        console.error("加载模型出错:", e);
    }
}

// 创建一辆车模型作为第一视角的载体
let vehicle = null;
function createVehicle(modelCenter) {
    // 从模型中心位置提取经纬度（用于放置车辆）
    const cartographic = Cesium.Cartographic.fromCartesian(modelCenter);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height + 2; // 稍微抬高一点，防止陷入地面
    
    console.log(`车辆位置: 经度=${longitude}, 纬度=${latitude}, 高度=${height}`);
    
    // 选择使用哪种模型方式
    const useLocalModel = true; // 设置为true使用本地模型，false使用Cesium Ion模型
    const useCesiumIonModel = false; // 设置为true使用Cesium Ion模型，false使用简单盒子
    
    let newVehicle = null;
    
    // 选项1: 使用本地模型文件
    if (useLocalModel) {
        newVehicle = viewer.entities.add({
            name: '模拟车辆(本地模型)',
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
            model: {
                uri: './models/vehicles/car.glb',
                minimumPixelSize: 32, // 减小最小像素大小
                maximumScale: 10000,  // 减小最大缩放
                scale: 1.25,          // 减小模型比例
                runAnimations: false,
                // 确保模型朝向正确的方向
                nodeTransformations: {
                    // 调整模型初始方向，使其与路线对齐
                    "root": new Cesium.TranslationRotationScale(
                        new Cesium.Cartesian3(0, 0, 0),
                        Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(270)),
                        new Cesium.Cartesian3(1, 1, 1)
                    )
                }
            }
        });
    }
    // 选项2: 使用Cesium Ion Assets模型
    else if (useCesiumIonModel) {
        // 使用Cesium Ion中的示例汽车模型
        // Cesium Ion Asset ID: 1455021 (Cesium简单汽车模型)
        const cesiumIonModelId = 1455021; // 可以替换为您在Cesium Ion上的其他模型ID
        
        newVehicle = viewer.entities.add({
            name: '模拟车辆(Cesium Ion模型)',
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
            model: {
                uri: Cesium.IonResource.fromAssetId(cesiumIonModelId),
                minimumPixelSize: 64,
                maximumScale: 20000,
                scale: 5.0, // 根据模型调整比例
                runAnimations: false
            },
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0), 0, 0)
            )
        });
    } 
    // 选项3: 如果前两种方式不可用，使用简单盒子
    else {
        console.warn("使用简单盒子作为车辆模型");
        newVehicle = viewer.entities.add({
            name: '模拟车辆(简化盒子)',
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
            box: {
                dimensions: new Cesium.Cartesian3(10.0, 5.0, 3.0), // 长宽高
                material: Cesium.Color.RED.withAlpha(0.9)
            },
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0), 0, 0)
            )
        });
    }
    
    // 设置全局vehicle变量
    vehicle = newVehicle;
    return vehicle;
}

// 实现第一视角
function enableFirstPersonView() {
    if (!vehicle) return;
    
    const position = vehicle.position.getValue(viewer.clock.currentTime);
    
    // 设置相机跟随车辆
    viewer.camera.flyTo({
        destination: position,
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(0),
            roll: 0
        },
        duration: 1.0
    });
    
    // 相机与车辆绑定（可根据需求调整视角偏移）
    viewer.trackedEntity = vehicle;
}

// 实现俯视视角
function enableTopView() {
    viewer.trackedEntity = undefined;
    
    if (vehicle) {
        const position = vehicle.position.getValue(viewer.clock.currentTime);
        
        viewer.camera.flyTo({
            destination: new Cesium.Cartesian3(
                position.x,
                position.y,
                position.z + 500 // 高度偏移
            ),
            orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-90), // 垂直向下看
                roll: 0
            },
            duration: 1.0
        });
    }
}

// 模拟车辆沿道路行驶
let simulationActive = false;
let customRoute = []; // 移除默认路线，因为我们使用用户选择的点

// 设置自定义路线
function setCustomRoute(route) {
    if (Array.isArray(route) && route.length >= 2) {
        customRoute = route;
        console.log('路线已更新:', customRoute);
    }
}

function startVehicleSimulation() {
    if (!vehicle || simulationActive || customRoute.length < 2) return;
    
    simulationActive = true;
    
    // 设置固定速度（米/秒）
    const speed = 20.0; // 可以调整这个值来改变速度
    
    // 计算路线点之间的时间
    const route = [];
    let totalTime = 0;
    
    for (let i = 0; i < customRoute.length; i++) {
        const point = customRoute[i];
        
        if (i > 0) {
            // 计算与前一个点的距离
            const prevPoint = customRoute[i - 1];
            const distance = Cesium.Cartesian3.distance(
                Cesium.Cartesian3.fromDegrees(prevPoint.lon, prevPoint.lat, prevPoint.height),
                Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.height)
            );
            
            // 根据速度计算所需时间
            const timeInterval = distance / speed;
            totalTime += timeInterval;
        }
        
        route.push({
            ...point,
            time: totalTime
        });
    }
    
    // 创建SampledPositionProperty来存储车辆位置随时间变化
    const position = new Cesium.SampledPositionProperty();
    
    // 添加各个路径点
    for (const point of route) {
        const time = Cesium.JulianDate.addSeconds(
            viewer.clock.currentTime,
            point.time,
            new Cesium.JulianDate()
        );
        
        position.addSample(
            time,
            Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.height)
        );
    }
    
    // 配置车辆位置随时间变化
    vehicle.position = position;
    
    // 计算每个位置点的方向并设置车辆朝向
    const velocityOrientationProperty = new Cesium.VelocityOrientationProperty(position);
    
    // 创建一个新的方向属性，结合速度方向和模型初始旋转
    const customOrientationProperty = new Cesium.CallbackProperty((time, result) => {
        // 获取速度方向
        const velocityOrientation = velocityOrientationProperty.getValue(time, result);
        if (!velocityOrientation) return undefined;
        
        // 添加270度旋转，使模型面向行进方向
        const rotation = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(270));
        const modified = Cesium.Matrix3.multiply(
            Cesium.Matrix3.fromQuaternion(velocityOrientation),
            rotation,
            new Cesium.Matrix3()
        );
        
        return Cesium.Quaternion.fromRotationMatrix(modified);
    }, false);
    
    vehicle.orientation = customOrientationProperty;
    
    // 配置时钟
    const startTime = Cesium.JulianDate.addSeconds(
        viewer.clock.currentTime,
        0,
        new Cesium.JulianDate()
    );
    
    const stopTime = Cesium.JulianDate.addSeconds(
        viewer.clock.currentTime,
        totalTime,
        new Cesium.JulianDate()
    );
    
    viewer.clock.startTime = startTime;
    viewer.clock.stopTime = stopTime;
    viewer.clock.currentTime = startTime;
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    viewer.clock.multiplier = 1;
    
    viewer.clock.shouldAnimate = true;
}

function stopVehicleSimulation() {
    simulationActive = false;
    viewer.clock.shouldAnimate = false;
}

// 性能优化函数
function optimizePerformance() {
    // 减少GPU内存使用
    viewer.scene.fog.enabled = false; // 关闭雾效果
    
    // 优化3D Tiles
    viewer.scene.globe.maximumScreenSpaceError = 4; // 增加地表细节级别阈值，减少细节
    
    // 禁用不需要的特性
    viewer.scene.globe.enableLighting = false;      // 禁用全局光照
    viewer.scene.moon.show = false;                 // 隐藏月球
    viewer.scene.sun.show = false;                  // 隐藏太阳
    viewer.scene.skyBox.show = false;               // 隐藏天空盒
    viewer.scene.skyAtmosphere.show = false;        // 隐藏大气层
    viewer.scene.globe.showGroundAtmosphere = false;// 隐藏地面大气效果
    
    // 预取瓦片以减少加载等待时间
    viewer.scene.globe.preloadSiblings = false;
    viewer.scene.globe.tileCacheSize = 100;         // 减少瓦片缓存大小
    
    // 限制帧率以降低CPU和GPU负载
    viewer.targetFrameRate = 30;
    
    // 使用请求批处理，减少HTTP请求数
    viewer.scene.primitives.enableBatchingWhenNeeded = true;
    
    // 完全禁用阴影
    viewer.shadows = false;
    viewer.terrainShadows = Cesium.ShadowMode.DISABLED;
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showGroundAtmosphere = false;
}

// 添加提示信息
const helpDiv = document.createElement('div');
helpDiv.style.position = 'absolute';
helpDiv.style.top = '50%';
helpDiv.style.left = '50%';
helpDiv.style.transform = 'translate(-50%, -50%)';
helpDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
helpDiv.style.color = 'white';
helpDiv.style.padding = '20px';
helpDiv.style.borderRadius = '5px';
helpDiv.style.fontSize = '16px';
helpDiv.style.fontFamily = 'Arial, sans-serif';
helpDiv.style.pointerEvents = 'none'; // 防止干扰鼠标事件
helpDiv.style.transition = 'opacity 0.5s';
helpDiv.style.opacity = '0';
helpDiv.innerHTML = '按住Ctrl + 鼠标左键选择路线点';
document.body.appendChild(helpDiv);

// 显示提示信息的函数
function showHelp() {
    helpDiv.style.opacity = '1';
    setTimeout(() => {
        helpDiv.style.opacity = '0';
    }, 3000); // 3秒后淡出
}

// 初始化应用
function initApp() {
    initScene();
    loadRoadModel();
    optimizePerformance();
    setupEventListeners();
    showHelp(); // 显示提示信息
}

// 启动应用
initApp(); 