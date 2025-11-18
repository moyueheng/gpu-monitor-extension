import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GPUInfo {
    name: string;
    usage: number;
    temperature: number;
    memoryUsed: number;
    memoryTotal: number;
    powerUsage: number;
    driverVersion?: string;
}

export class GPUMonitor {
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;
    private refreshInterval: NodeJS.Timeout | undefined;
    private isActive: boolean = true;
    private currentGPUInfo: GPUInfo[] = [];

    constructor(private context: vscode.ExtensionContext) {
        // 创建状态栏项 - 改为左侧显示
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'gpuMonitor.refresh';
        this.context.subscriptions.push(this.statusBarItem);

        // 创建输出通道
        this.outputChannel = vscode.window.createOutputChannel('GPU Monitor');
        this.context.subscriptions.push(this.outputChannel);

        // 监听配置变化
        vscode.workspace.onDidChangeConfiguration(() => {
            this.restartMonitoring();
        });
    }

    public start(): void {
        this.updateStatusBar();
        this.startMonitoring();
        this.outputChannel.appendLine('GPU监控已启动');
    }

    public toggleMonitoring(): void {
        this.isActive = !this.isActive;

        if (this.isActive) {
            this.startMonitoring();
            this.outputChannel.appendLine('GPU监控已启用');
        } else {
            this.stopMonitoring();
            // 状态栏保持显示，只显示禁用状态
            this.statusBarItem.text = '$(eye-closed) GPU监控已禁用';
            this.statusBarItem.tooltip = 'GPU监控已禁用\n点击启用监控';
            this.statusBarItem.show();
            this.outputChannel.appendLine('GPU监控已禁用');
        }
    }

    public async refreshGPUInfo(): Promise<void> {
        try {
            this.currentGPUInfo = await this.getGPUInfo();
            this.updateStatusBar();
            this.showDetailedInfo();
            this.outputChannel.appendLine(`GPU信息已刷新 - ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    private async startMonitoring(): Promise<void> {
        const config = vscode.workspace.getConfiguration('gpuMonitor');
        const interval = config.get<number>('refreshInterval', 2000);

        this.stopMonitoring();

        if (config.get<boolean>('showStatusBar', true)) {
            this.statusBarItem.show();
        }

        this.refreshInterval = setInterval(async () => {
            if (this.isActive) {
                try {
                    this.currentGPUInfo = await this.getGPUInfo();
                    this.updateStatusBar();
                } catch (error) {
                    // 静默处理错误，避免频繁的错误提示
                    console.error('GPU监控错误:', error);
                }
            }
        }, interval);

        // 立即获取一次GPU信息
        await this.refreshGPUInfo();
    }

    private stopMonitoring(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = undefined;
        }
    }

    private async getGPUInfo(): Promise<GPUInfo[]> {
        try {
            // 尝试使用nvidia-smi (NVIDIA GPU)
            return await this.getNvidiaGPUInfo();
        } catch (nvidiaError) {
            try {
                // 尝试使用AMD GPU工具
                return await this.getAMDGPUInfo();
            } catch (amdError) {
                // 尝试使用系统工具获取GPU信息
                return await this.getSystemGPUInfo();
            }
        }
    }

    private async getNvidiaGPUInfo(): Promise<GPUInfo[]> {
        const { stdout } = await execAsync('nvidia-smi --query-gpu=name,utilization.gpu,temperature.gpu,memory.used,memory.total,power.draw,driver_version --format=csv,noheader,nounits');

        const lines = stdout.trim().split('\n');
        return lines.map(line => {
            const [name, usage, temperature, memoryUsed, memoryTotal, powerUsage, driverVersion] = line.split(',').map(s => s.trim());

            return {
                name,
                usage: parseFloat(usage) || 0,
                temperature: parseFloat(temperature) || 0,
                memoryUsed: parseFloat(memoryUsed) || 0,
                memoryTotal: parseFloat(memoryTotal) || 0,
                powerUsage: parseFloat(powerUsage) || 0,
                driverVersion: driverVersion || undefined
            };
        });
    }

    private async getAMDGPUInfo(): Promise<GPUInfo[]> {
        try {
            // 使用rocm-smi获取AMD GPU信息
            const { stdout } = await execAsync('rocm-smi --showuse --showtemp --showmeminfo vram --showpower');

            // 解析AMD GPU输出
            const gpuInfo: GPUInfo = {
                name: 'AMD GPU',
                usage: this.extractValue(stdout, /GPU\s*\d+:\s*(\d+)%/),
                temperature: this.extractValue(stdout, /Temperature\(Sensor edge\):\s*(\d+)/),
                memoryUsed: this.extractValue(stdout, /VRAM\s*Total\s*Memory.*?(\d+)/),
                memoryTotal: this.extractValue(stdout, /VRAM\s*Total\s*Memory.*?(\d+)/) * 1024, // 假设值
                powerUsage: this.extractValue(stdout, /Average\s*Graphics\s*Power:\s*([\d.]+)/)
            };

            return [gpuInfo];
        } catch (error) {
            throw new Error('AMD GPU监控不可用');
        }
    }

    private async getSystemGPUInfo(): Promise<GPUInfo[]> {
        try {
            // 在Linux系统上尝试从 /sys/class/drm 获取GPU信息
            if (process.platform === 'linux') {
                const { stdout } = await execAsync('lshw -c display 2>/dev/null | grep -E "(product|configuration)"');

                const gpuInfo: GPUInfo = {
                    name: 'System GPU',
                    usage: 0, // 系统工具通常无法获取使用率
                    temperature: 0,
                    memoryUsed: 0,
                    memoryTotal: 0,
                    powerUsage: 0
                };

                return [gpuInfo];
            }
            throw new Error('无法获取GPU信息');
        } catch (error) {
            throw new Error('未检测到支持的GPU或GPU监控工具');
        }
    }

    private extractValue(text: string, regex: RegExp): number {
        const match = text.match(regex);
        return match ? parseFloat(match[1]) : 0;
    }

    private updateStatusBar(): void {
        const config = vscode.workspace.getConfiguration('gpuMonitor');

        if (!config.get<boolean>('showStatusBar', true) || !this.isActive) {
            this.statusBarItem.hide();
            return;
        }

        if (this.currentGPUInfo.length === 0) {
            this.statusBarItem.text = '$(warning) GPU监控不可用';
            this.statusBarItem.tooltip = '未检测到GPU或监控工具';
            return;
        }

        const mainGPU = this.currentGPUInfo[0];
        const parts: string[] = [];

        // GPU使用率
        if (config.get<boolean>('showPercentage', true)) {
            parts.push(`${Math.round(mainGPU.usage)}%`);
        }

        // 温度
        if (config.get<boolean>('showTemperature', true) && mainGPU.temperature > 0) {
            parts.push(`${Math.round(mainGPU.temperature)}°C`);
        }

        // 内存使用
        if (config.get<boolean>('showMemoryUsage', true) && mainGPU.memoryTotal > 0) {
            const memoryGB = (mainGPU.memoryUsed / 1024).toFixed(1);
            const totalGB = (mainGPU.memoryTotal / 1024).toFixed(1);
            parts.push(`${memoryGB}/${totalGB}GB`);
        }

        this.statusBarItem.text = `$(pulse) ${mainGPU.name} ${parts.join(' | ')}`;
        this.statusBarItem.tooltip = this.getTooltipText();
    }

    private getTooltipText(): string {
        if (this.currentGPUInfo.length === 0) {
            return 'GPU监控不可用';
        }

        let tooltip = 'GPU监控信息:\n\n';
        this.currentGPUInfo.forEach((gpu, index) => {
            tooltip += `GPU ${index + 1}: ${gpu.name}\n`;
            tooltip += `  使用率: ${gpu.usage.toFixed(1)}%\n`;

            if (gpu.temperature > 0) {
                tooltip += `  温度: ${gpu.temperature.toFixed(1)}°C\n`;
            }

            if (gpu.memoryTotal > 0) {
                const usedGB = (gpu.memoryUsed / 1024).toFixed(2);
                const totalGB = (gpu.memoryTotal / 1024).toFixed(2);
                tooltip += `  内存: ${usedGB}/${totalGB} GB\n`;
            }

            if (gpu.powerUsage > 0) {
                tooltip += `  功耗: ${gpu.powerUsage.toFixed(1)}W\n`;
            }

            tooltip += '\n';
        });

        tooltip += '点击切换监控状态';
        return tooltip;
    }

    private showDetailedInfo(): void {
        if (this.currentGPUInfo.length === 0) {
            vscode.window.showWarningMessage('无法获取GPU信息');
            return;
        }

        const mainGPU = this.currentGPUInfo[0];
        const message = `
GPU: ${mainGPU.name}
使用率: ${mainGPU.usage.toFixed(1)}%
${mainGPU.temperature > 0 ? `温度: ${mainGPU.temperature.toFixed(1)}°C` : ''}
${mainGPU.memoryTotal > 0 ? `内存: ${(mainGPU.memoryUsed / 1024).toFixed(2)}/${(mainGPU.memoryTotal / 1024).toFixed(2)} GB` : ''}
${mainGPU.powerUsage > 0 ? `功耗: ${mainGPU.powerUsage.toFixed(1)}W` : ''}
        `.trim();

        vscode.window.showInformationMessage(message, '查看详细信息').then(selection => {
            if (selection === '查看详细信息') {
                this.outputChannel.show();
                this.outputChannel.clear();
                this.outputChannel.appendLine('=== GPU详细信息 ===');
                this.outputChannel.appendLine(`时间: ${new Date().toLocaleString()}`);
                this.outputChannel.appendLine('');

                this.currentGPUInfo.forEach((gpu, index) => {
                    this.outputChannel.appendLine(`GPU ${index + 1}: ${gpu.name}`);
                    this.outputChannel.appendLine(`  使用率: ${gpu.usage.toFixed(2)}%`);
                    this.outputChannel.appendLine(`  温度: ${gpu.temperature.toFixed(1)}°C`);
                    this.outputChannel.appendLine(`  内存使用: ${gpu.memoryUsed.toFixed(0)} MB / ${gpu.memoryTotal.toFixed(0)} MB`);
                    this.outputChannel.appendLine(`  功耗: ${gpu.powerUsage.toFixed(1)}W`);
                    if (gpu.driverVersion) {
                        this.outputChannel.appendLine(`  驱动版本: ${gpu.driverVersion}`);
                    }
                    this.outputChannel.appendLine('');
                });
            }
        });
    }

    private handleError(error: any): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.outputChannel.appendLine(`错误: ${errorMessage}`);

        if (this.isActive) {
            this.statusBarItem.text = '$(error) GPU监控错误';
            this.statusBarItem.tooltip = `错误: ${errorMessage}\n点击重试`;
        }
    }

    private restartMonitoring(): void {
        if (this.isActive) {
            this.startMonitoring();
        }
    }

    public dispose(): void {
        this.stopMonitoring();
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
}