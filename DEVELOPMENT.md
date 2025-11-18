# GPU Monitor Extension 开发指南

## 项目结构

```
gpu-monitor-extension/
├── src/
│   ├── extension.ts      # 插件入口文件
│   ├── gpuMonitor.ts     # GPU监控核心逻辑
│   └── test/            # 测试文件
├── out/                 # 编译输出目录
├── package.json         # 项目配置和依赖
├── tsconfig.json        # TypeScript配置
├── README.md            # 用户文档
├── DEVELOPMENT.md       # 开发文档 (本文件)
└── launch.sh           # 开发启动脚本
```

## 开发环境设置

### 1. 安装依赖
```bash
npm install
```

### 2. 编译TypeScript
```bash
npm run compile
```

### 3. 启动调试
- 在VSCode中按 `F5` 启动新的开发窗口
- 或使用命令: `code --extensionDevelopmentPath=.`

## 核心功能模块

### GPUMonitor 类 (`src/gpuMonitor.ts`)

主要功能：
- GPU信息获取 (NVIDIA, AMD, 系统工具)
- 状态栏显示管理
- 配置监听和应用
- 错误处理和日志记录

关键方法：
- `getGPUInfo()` - 获取GPU信息
- `updateStatusBar()` - 更新状态栏显示
- `startMonitoring()` - 启动监控
- `toggleMonitoring()` - 切换监控状态

### 插件入口 (`src/extension.ts`)

- 注册VSCode命令
- 初始化GPUMonitor实例
- 管理插件生命周期

## 开发任务

### 添加新的GPU支持
1. 在 `GPUMonitor` 类中添加新的获取方法
2. 更新 `getGPUInfo()` 方法的调用顺序
3. 添加相应的测试

### 扩展状态栏显示
1. 在 `updateStatusBar()` 方法中添加新的显示元素
2. 在 `package.json` 中添加对应的配置选项
3. 更新 `getTooltipText()` 方法

### 添加新命令
1. 在 `package.json` 的 `contributes.commands` 中注册命令
2. 在 `extension.ts` 中添加命令处理函数
3. 将命令添加到订阅列表

## 测试

### 本地测试
1. 启动开发环境 (F5)
2. 在新窗口中测试功能
3. 检查输出面板的 "GPU Monitor" 频道

### GPU工具测试
```bash
# NVIDIA GPU测试
nvidia-smi --query-gpu=name,utilization.gpu,temperature.gpu,memory.used,memory.total --format=csv

# AMD GPU测试
rocm-smi --showuse --showtemp --showmeminfo vram

# 系统信息测试
lshw -c display
```

## 调试技巧

### 1. 输出调试信息
```typescript
this.outputChannel.appendLine(`调试信息: ${data}`);
```

### 2. 状态栏调试
```typescript
this.statusBarItem.text = `调试: ${debugInfo}`;
this.statusBarItem.show();
```

### 3. 错误处理
```typescript
try {
    // 你的代码
} catch (error) {
    this.handleError(error);
    console.error('详细错误:', error);
}
```

## 打包和发布

### 1. 安装vsce工具
```bash
npm install -g vsce
```

### 2. 创建发布者账户
在 [Visual Studio Marketplace](https://marketplace.visualstudio.com/) 创建发布者

### 3. 打包扩展
```bash
vsce package
```

### 4. 发布扩展
```bash
vsce publish
```

## 配置选项

所有配置都在 `package.json` 的 `contributes.configuration` 部分：

- `gpuMonitor.refreshInterval` - 刷新间隔
- `gpuMonitor.showStatusBar` - 状态栏显示
- `gpuMonitor.showPercentage` - 使用率显示
- `gpuMonitor.showTemperature` - 温度显示
- `gpuMonitor.showMemoryUsage` - 内存显示

## 版本更新

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md` 记录变更
3. 重新编译: `npm run compile`
4. 重新打包: `vsce package`

## 常见问题

### 1. TypeScript编译错误
- 检查 `tsconfig.json` 配置
- 确保类型定义正确安装
- 清除 `out/` 目录重新编译

### 2. GPU信息获取失败
- 检查系统是否安装了相应的GPU工具
- 测试命令行工具是否正常工作
- 查看输出面板的错误信息

### 3. 状态栏不显示
- 检查配置是否启用状态栏显示
- 确认插件已正确激活
- 查看是否有JavaScript错误

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 编写代码和测试
4. 提交Pull Request

## 许可证

MIT License - 详见 LICENSE 文件