#!/bin/bash

# GPU Monitor VSCode Extension 开发启动脚本

echo "🚀 启动GPU监控插件开发环境..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 编译TypeScript
echo "🔨 编译TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo "✅ 编译成功!"
echo ""
echo "🎯 开发说明:"
echo "1. 在VSCode中按F5启动调试会话"
echo "2. 或使用 'code --extensionDevelopmentPath=.' 启动开发模式"
echo "3. 修改代码后运行 'npm run compile' 重新编译"
echo "4. 打包发布时使用: vsce package"
echo ""
echo "🔍 测试GPU监控工具:"
echo " NVIDIA GPU: nvidia-smi"
echo " AMD GPU: rocm-smi"
echo " 系统信息: lshw -c display"