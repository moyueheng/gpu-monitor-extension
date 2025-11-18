# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个VSCode GPU监控插件，使用TypeScript开发，支持实时监控NVIDIA和AMD GPU的使用情况、温度和内存状态。

## 常用开发命令

### 基础开发
```bash
# 安装依赖
npm install

# 编译TypeScript代码
npm run compile

# 持续监控编译（开发模式）
npm run watch

# 运行测试
npm test

# 代码检查
npm run lint
```

### 调试和启动
```bash
# 在VSCode中按F5启动调试会话
# 或使用命令行启动开发窗口
code --extensionDevelopmentPath=.

# 使用launch脚本快速启动
./launch.sh
```

### 打包和发布
```bash
# 安装vsce工具
npm install -g vsce

# 打包扩展
vsce package

# 发布扩展
vsce publish
```

## 代码架构

### 核心文件结构
- `src/extension.ts` - 插件入口点，处理VSCode激活/停用生命周期
- `src/gpuMonitor.ts` - 核心GPU监控逻辑和状态栏管理
- `out/` - TypeScript编译输出目录

### 架构设计

**GPUMonitor类** (`src/gpuMonitor.ts`) - 核心监控引擎
- GPU信息获取：按优先级尝试NVIDIA → AMD → 系统工具
- 状态栏集成：可配置的显示内容和格式
- 配置管理：实时监听VSCode配置变更
- 错误处理：优雅降级和详细错误报告

**GPU信息获取策略** (`src/gpuMonitor.ts:103-179`)
1. 首先尝试 `nvidia-smi` 获取NVIDIA GPU信息
2. 失败后尝试 `rocm-smi` 获取AMD GPU信息
3. 最后尝试系统工具如 `lshw` 获取基本GPU信息

**插件生命周期** (`src/extension.ts`)
- `activate()` - 初始化GPUMonitor实例并注册命令
- `deactivate()` - 清理资源

### VSCode集成点

**命令注册** (`package.json:18-29`)
- `gpuMonitor.refresh` - 手动刷新GPU信息
- `gpuMonitor.toggle` - 开启/关闭监控

**配置选项** (`package.json:48-78`)
- `gpuMonitor.refreshInterval` - 刷新间隔(1000-10000ms)
- `gpuMonitor.showStatusBar` - 状态栏显示开关
- `gpuMonitor.showPercentage` - 使用率显示
- `gpuMonitor.showTemperature` - 温度显示
- `gpuMonitor.showMemoryUsage` - 内存使用显示

## GPU工具测试

开发时可以测试以下命令确保GPU工具正常工作：
```bash
# NVIDIA GPU测试
nvidia-smi --query-gpu=name,utilization.gpu,temperature.gpu,memory.used,memory.total --format=csv

# AMD GPU测试
rocm-smi --showuse --showtemp --showmeminfo vram

# 系统信息测试
lshw -c display
```

## 开发注意事项

- GPU监控错误采用静默处理，避免频繁错误干扰用户
- 状态栏图标使用VSCode内置图标如 `$(pulse)`、`$(warning)`、`$(error)`
- 所有外部命令调用都使用异步方式并包含错误处理
- 配置变更会自动重启监控服务
- 支持多GPU环境，显示主要GPU信息在状态栏

## 测试要求

- 本地测试使用F5启动开发窗口
- 测试不同GPU环境（NVIDIA/AMD/无GPU）
- 验证配置变更实时生效
- 检查状态栏显示和工具提示信息