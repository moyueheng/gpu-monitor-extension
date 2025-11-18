# 更新日志

本文档记录了GPU Monitor扩展的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2025-01-18

### 新增
- 🎉 首次发布GPU Monitor VSCode扩展
- 📊 实时显示GPU使用率、温度和内存使用情况
- 🔧 可自定义的状态栏显示选项
- 📈 支持多GPU环境
- ⚡ 低性能开销，可配置刷新间隔
- 🎨 美观的状态栏集成
- 🖥️ 支持NVIDIA (nvidia-smi) 和AMD (rocm-smi) GPU
- 📍 状态栏位置调整为左侧显示
- 👆 点击状态栏刷新GPU信息
- 👁️ 监控状态切换时保持状态栏可见性

### 支持的功能
- NVIDIA GPU监控 (需要nvidia-smi)
- AMD GPU监控 (需要rocm-smi)
- 系统GPU信息获取 (使用lshw)
- 可配置的刷新间隔 (1-10秒)
- 可选择显示项目 (使用率、温度、内存)
- 多GPU支持
- 详细的GPU信息输出

### 命令
- `GPU Monitor: Refresh GPU Info` - 手动刷新GPU信息
- `GPU Monitor: Toggle GPU Monitoring` - 开启/关闭监控

### 配置选项
- `gpuMonitor.refreshInterval` - 刷新间隔设置
- `gpuMonitor.showStatusBar` - 状态栏显示开关
- `gpuMonitor.showPercentage` - 使用率百分比显示
- `gpuMonitor.showTemperature` - 温度显示
- `gpuMonitor.showMemoryUsage` - 内存使用情况显示