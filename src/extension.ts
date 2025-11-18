import * as vscode from 'vscode';
import { GPUMonitor } from './gpuMonitor';

export function activate(context: vscode.ExtensionContext) {
    console.log('GPU Monitor extension is now active!');

    const gpuMonitor = new GPUMonitor(context);

    // 注册命令
    const refreshCommand = vscode.commands.registerCommand('gpuMonitor.refresh', () => {
        gpuMonitor.refreshGPUInfo();
    });

    const toggleCommand = vscode.commands.registerCommand('gpuMonitor.toggle', () => {
        gpuMonitor.toggleMonitoring();
    });

    // 将命令添加到插件的订阅列表中
    context.subscriptions.push(refreshCommand, toggleCommand);

    // 启动GPU监控
    gpuMonitor.start();
}

export function deactivate() {
    console.log('GPU Monitor extension has been deactivated');
}