import * as vscode from 'vscode';
import { WorkflowTracker } from '../workflow/WorkflowTracker';

export class WorkflowStatusProvider implements vscode.TreeDataProvider<StatusItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<StatusItem | undefined | null | void> = new vscode.EventEmitter<StatusItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<StatusItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workflowTracker: WorkflowTracker) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: StatusItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: StatusItem): Thenable<StatusItem[]> {
        if (!element) {
            return Promise.resolve(this.getStatusItems());
        }
        return Promise.resolve([]);
    }

    private getStatusItems(): StatusItem[] {
        const items: StatusItem[] = [];
        const isRecording = this.workflowTracker.isCurrentlyRecording();
        const currentWorkflow = this.workflowTracker.getCurrentWorkflow();

        // Kayıt durumu
        items.push(new StatusItem(
            isRecording ? '🔴 Kayıt Devam Ediyor' : '⚪ Kayıt Durduruldu',
            isRecording ? 'Aktif olarak kayıt yapılıyor' : 'Şu anda kayıt yapılmıyor',
            vscode.TreeItemCollapsibleState.None
        ));

        if (currentWorkflow) {
            // Oturum bilgileri
            const startTime = new Date(currentWorkflow.startTime).toLocaleTimeString('tr-TR');
            items.push(new StatusItem(
                `📅 Başlangıç: ${startTime}`,
                'Oturum başlangıç zamanı',
                vscode.TreeItemCollapsibleState.None
            ));

            // Olay sayısı
            items.push(new StatusItem(
                `📊 Toplam Olay: ${currentWorkflow.events.length}`,
                'Kaydedilen toplam olay sayısı',
                vscode.TreeItemCollapsibleState.None
            ));

            // Son olay
            if (currentWorkflow.events.length > 0) {
                const lastEvent = currentWorkflow.events[currentWorkflow.events.length - 1];
                const lastEventTime = new Date(lastEvent.timestamp).toLocaleTimeString('tr-TR');
                items.push(new StatusItem(
                    `⏰ Son Olay: ${lastEventTime}`,
                    `Son olay: ${lastEvent.type}`,
                    vscode.TreeItemCollapsibleState.None
                ));
            }

            // Workspace bilgisi
            if (currentWorkflow.workspace) {
                const workspaceName = currentWorkflow.workspace.split(/[\\/]/).pop() || 'Bilinmeyen';
                items.push(new StatusItem(
                    `📁 Workspace: ${workspaceName}`,
                    currentWorkflow.workspace,
                    vscode.TreeItemCollapsibleState.None
                ));
            }
        }

        // Hızlı eylemler
        if (isRecording) {
            items.push(new StatusItem(
                '⏹️ Kaydı Durdur',
                'Workflow kaydını durdur',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'workflowSnapshot.stopRecording',
                    title: 'Kaydı Durdur'
                }
            ));

            items.push(new StatusItem(
                '📋 Rapor Oluştur',
                'Mevcut workflow için rapor oluştur',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'workflowSnapshot.generateReport',
                    title: 'Rapor Oluştur'
                }
            ));
        } else {
            items.push(new StatusItem(
                '▶️ Kaydı Başlat',
                'Yeni workflow kaydı başlat',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'workflowSnapshot.startRecording',
                    title: 'Kaydı Başlat'
                }
            ));
        }

        items.push(new StatusItem(
            '🤖 AI Asistanı',
            'AI asistanını aç',
            vscode.TreeItemCollapsibleState.None,
            {
                command: 'workflowSnapshot.openAIAssistant',
                title: 'AI Asistanı'
            }
        ));

        return items;
    }
}

class StatusItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = command;
    }
}
