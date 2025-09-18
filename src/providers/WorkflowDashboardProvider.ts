import * as vscode from 'vscode';
import { WorkflowTracker } from '../workflow/WorkflowTracker';

export class WorkflowDashboardProvider implements vscode.TreeDataProvider<DashboardItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DashboardItem | undefined | null | void> = new vscode.EventEmitter<DashboardItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DashboardItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workflowTracker: WorkflowTracker, private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DashboardItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: DashboardItem): Promise<DashboardItem[]> {
        if (!element) {
            return this.getDashboardItems();
        }
        return [];
    }

    private async getDashboardItems(): Promise<DashboardItem[]> {
        const items: DashboardItem[] = [];
        const isRecording = this.workflowTracker.isCurrentlyRecording();
        const currentWorkflow = this.workflowTracker.getCurrentWorkflow();

        // Ana durum göstergesi
        const statusIcon = isRecording ? '🔴' : '⚪';
        const statusText = isRecording ? 'Recording Active' : 'Recording Stopped';
        items.push(new DashboardItem(
            `${statusIcon} ${statusText}`,
            isRecording ? 'Actively recording workflow activities' : 'No recording in progress',
            vscode.TreeItemCollapsibleState.None,
            'status'
        ));

        // Hızlı eylem butonları
        items.push(new DashboardItem(
            '── Quick Actions ──',
            '',
            vscode.TreeItemCollapsibleState.None,
            'separator'
        ));

        if (isRecording) {
            items.push(new DashboardItem(
                '⏹️ Stop Recording',
                'Stop current workflow recording session',
                vscode.TreeItemCollapsibleState.None,
                'button',
                {
                    command: 'workflowSnapshot.stopRecording',
                    title: 'Stop Recording'
                }
            ));

            items.push(new DashboardItem(
                '📋 Generate Report',
                'Create detailed report for current workflow',
                vscode.TreeItemCollapsibleState.None,
                'button',
                {
                    command: 'workflowSnapshot.generateReport',
                    title: 'Generate Report'
                }
            ));
        } else {
            items.push(new DashboardItem(
                '▶️ Start Recording',
                'Begin new workflow recording session',
                vscode.TreeItemCollapsibleState.None,
                'button',
                {
                    command: 'workflowSnapshot.startRecording',
                    title: 'Start Recording'
                }
            ));
        }

        items.push(new DashboardItem(
            '🔄 Replay Workflow',
            'Replay recorded workflow from file',
            vscode.TreeItemCollapsibleState.None,
            'button',
            {
                command: 'workflowSnapshot.replayWorkflow',
                title: 'Replay Workflow'
            }
        ));

        items.push(new DashboardItem(
            '🤖 AI Assistant',
            'Open AI assistant for workflow analysis and optimization',
            vscode.TreeItemCollapsibleState.None,
            'button',
            {
                command: 'workflowSnapshot.openAIAssistant',
                title: 'AI Assistant'
            }
        ));

        // Mevcut oturum bilgileri
        if (currentWorkflow) {
            items.push(new DashboardItem(
                '── Current Session ──',
                '',
                vscode.TreeItemCollapsibleState.None,
                'separator'
            ));

            const startTime = new Date(currentWorkflow.startTime).toLocaleTimeString('en-US');
            items.push(new DashboardItem(
                `📅 ${startTime}`,
                'Session start time',
                vscode.TreeItemCollapsibleState.None,
                'info'
            ));

            items.push(new DashboardItem(
                `📊 ${currentWorkflow.events.length} Events`,
                'Total recorded events count',
                vscode.TreeItemCollapsibleState.None,
                'info'
            ));

            if (currentWorkflow.workspace) {
                const workspaceName = currentWorkflow.workspace.split(/[\\/]/).pop() || 'Unknown';
                items.push(new DashboardItem(
                    `📁 ${workspaceName}`,
                    currentWorkflow.workspace,
                    vscode.TreeItemCollapsibleState.None,
                    'info'
                ));
            }
        }

        // Son workflow'lar
        await this.addRecentWorkflows(items);

        return items;
    }

    private async addRecentWorkflows(items: DashboardItem[]): Promise<void> {
        try {
            const workflows = await this.workflowTracker.getWorkflowHistory();
            if (workflows.length > 0) {
                items.push(new DashboardItem(
                    '── Recent Workflows ──',
                    '',
                    vscode.TreeItemCollapsibleState.None,
                    'separator'
                ));

                // Show last 3 workflows
                workflows.slice(0, 3).forEach((workflow, index) => {
                    const date = new Date(workflow.startTime).toLocaleDateString('en-US');
                    const time = new Date(workflow.startTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    items.push(new DashboardItem(
                        `📝 ${date} ${time}`,
                        `${workflow.events.length} events • ${workflow.id}`,
                        vscode.TreeItemCollapsibleState.None,
                        'recent',
                        {
                            command: 'workflowSnapshot.showWorkflowDetails',
                            title: 'Workflow Details',
                            arguments: [workflow.id]
                        }
                    ));
                });

                if (workflows.length > 3) {
                    items.push(new DashboardItem(
                        `📂 +${workflows.length - 3} more...`,
                        'View all workflow history',
                        vscode.TreeItemCollapsibleState.None,
                        'more',
                        {
                            command: 'workflowSnapshot.showAllWorkflows',
                            title: 'Show All Workflows'
                        }
                    ));
                }
            }
        } catch (error) {
            console.error('Son workflow\'lar yüklenemedi:', error);
        }
    }
}

class DashboardItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.contextValue = contextValue;
        this.command = command;

        // Özel ikonlar ve stiller
        switch (contextValue) {
            case 'status':
                this.iconPath = new vscode.ThemeIcon('pulse');
                break;
            case 'button':
                this.iconPath = new vscode.ThemeIcon('play-circle');
                break;
            case 'info':
                this.iconPath = new vscode.ThemeIcon('info');
                break;
            case 'recent':
                this.iconPath = new vscode.ThemeIcon('history');
                break;
            case 'more':
                this.iconPath = new vscode.ThemeIcon('ellipsis');
                break;
            case 'separator':
                this.iconPath = new vscode.ThemeIcon('dash');
                // Ayırıcılar için özel stil
                this.description = '';
                this.resourceUri = undefined;
                break;
        }
    }
}
