# GPU Monitor VSCode Extension

一个用于监控GPU使用情况的VSCode插件，支持NVIDIA、AMD显卡和苹果M系列芯片。

## 功能特性

- 📊 实时显示GPU使用率、温度和内存使用情况
- 🔧 可自定义的状态栏显示选项
- 📈 支持多GPU环境
- ⚡ 低性能开销，可配置刷新间隔
- 🎨 美观的状态栏集成
- 🖥️ 支持NVIDIA (nvidia-smi)、AMD (rocm-smi) 和 Apple Silicon GPU

## 安装

### 从市场安装 (推荐)
1. 打开VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "GPU Monitor"
4. 点击安装

### 手动安装
1. 下载最新版本的 `.vsix` 文件
2. 打开VSCode命令面板 (`Ctrl+Shift+P`)
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的文件

## 使用方法

### 启动插件
插件安装后会自动启动并在状态栏显示GPU信息。

### 命令
- `GPU Monitor: Refresh GPU Info` - 手动刷新GPU信息
- `GPU Monitor: Toggle GPU Monitoring` - 开启/关闭监控

### 状态栏
点击状态栏上的GPU信息可以：
- 开启/关闭监控
- 查看详细信息

## 配置选项

在VSCode设置中搜索 "GPU Monitor" 可以配置以下选项：

| 设置 | 默认值 | 描述 |
|------|--------|------|
| `gpuMonitor.refreshInterval` | 2000 | 刷新间隔(毫秒) |
| `gpuMonitor.showStatusBar` | true | 在状态栏显示GPU信息 |
| `gpuMonitor.showPercentage` | true | 显示GPU使用率百分比 |
| `gpuMonitor.showTemperature` | true | 显示GPU温度 |
| `gpuMonitor.showMemoryUsage` | true | 显示GPU内存使用情况 |

## 支持的GPU和工具

### NVIDIA GPU
- 需要 `nvidia-smi` 工具 (通常随NVIDIA驱动安装)

### AMD GPU
- 需要 `rocm-smi` 工具 (ROCm工具包的一部分)

### Apple Silicon (M1/M2/M3)
- 自动检测Apple Silicon芯片
- 使用 `powermetrics` 和 `system_profiler` 获取GPU信息
- 支持GPU使用率、温度和统一内存监控
- 注意：某些功能需要管理员权限

### 系统信息
- 在Linux系统上尝试使用 `lshw` 获取基本GPU信息
- 在macOS上使用 `system_profiler` 作为备用方案

## 故障排除

### GPU信息不显示
1. 确认已安装相应的GPU监控工具
2. 检查驱动是否正确安装
3. 在输出面板中查看 "GPU Monitor" 频道的错误信息

### NVIDIA GPU
```bash
# 测试nvidia-smi是否可用
nvidia-smi
```

### AMD GPU
```bash
# 测试rocm-smi是否可用
rocm-smi
```

### Apple Silicon
```bash
# 测试system_profiler是否可用
system_profiler SPDisplaysDataType

# 测试powermetrics是否可用 (需要管理员权限)
sudo powermetrics -n 1 --samplers gpu_power

# 测试CPU检测
sysctl -n machdep.cpu.brand_string
```

## 开发

### 环境要求
- Node.js 16+
- VSCode 1.74+

### 构建
```bash
npm install
npm run compile
```

### 调试
1. 按F5启动调试会话
2. 在新的VSCode窗口中测试插件

### 打包
```bash
npm install -g vsce
vsce package
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持NVIDIA和AMD GPU监控
- 可配置的状态栏显示
- 多GPU支持

### v1.1.0 (开发中)
- 🆕 新增Apple Silicon (M1/M2/M3) 支持
- 集成powermetrics获取GPU使用率和温度
- 支持统一内存监控
- 自动检测Apple Silicon芯片
- 针对macOS优化的GPU检测逻辑