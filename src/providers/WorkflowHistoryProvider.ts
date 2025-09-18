import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { WorkflowSession } from '../workflow/types';

export class WorkflowHistoryProvider implements vscode.TreeDataProvider<HistoryItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryItem | undefined | null | void> = new vscode.EventEmitter<HistoryItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HistoryItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: HistoryItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: HistoryItem): Promise<HistoryItem[]> {
        if (!element) {
            return this.getWorkflowHistory();
        }
        return [];
    }

    private async getWorkflowHistory(): Promise<HistoryItem[]> {
        const items: HistoryItem[] = [];
        
        try {
            const workflowDir = path.join(this.context.globalStorageUri.fsPath, 'workflows');
            const reportsDir = path.join(this.context.globalStorageUri.fsPath, 'reports');
            
            // Workflow dosyalarını al
            if (await fs.pathExists(workflowDir)) {
                const workflowFiles = await fs.readdir(workflowDir);
                const workflows: Array<{file: string, session: WorkflowSession}> = [];

                for (const file of workflowFiles) {
                    if (file.endsWith('.json')) {
                        try {
                            const session = await fs.readJson(path.join(workflowDir, file));
                            workflows.push({ file, session });
                        } catch (error) {
                            console.error(`Workflow dosyası okunamadı: ${file}`, error);
                        }
                    }
                }

                // Tarihe göre sırala (en yeni önce)
                workflows.sort((a, b) => b.session.startTime - a.session.startTime);

                for (const { file, session } of workflows.slice(0, 10)) { // Son 10 workflow
                    const startDate = new Date(session.startTime);
                    const endDate = session.endTime ? new Date(session.endTime) : null;
                    const duration = endDate ? 
                        Math.round((endDate.getTime() - startDate.getTime()) / 1000 / 60) : 
                        'Devam ediyor';

                    const label = `${startDate.toLocaleDateString('tr-TR')} ${startDate.toLocaleTimeString('tr-TR')}`;
                    const description = `${session.events.length} olay • ${duration} dk`;
                    
                    const workflowPath = path.join(workflowDir, file);
                    const reportPath = path.join(reportsDir, `workflow_report_${session.id}.md`);
                    const hasReport = await fs.pathExists(reportPath);

                    const item = new HistoryItem(
                        label,
                        description,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'workflow'
                    );

                    // contextValue readonly olduğu için constructor'da ayarlanır
                    item.resourceUri = vscode.Uri.file(workflowPath);
                    
                    // Alt öğeler (eylemler)
                    const actions: HistoryItem[] = [];

                    actions.push(new HistoryItem(
                        '🔄 Yeniden Oynat',
                        'Bu workflow\'u yeniden oynat',
                        vscode.TreeItemCollapsibleState.None,
                        'action',
                        {
                            command: 'workflowSnapshot.replayWorkflow',
                            title: 'Yeniden Oynat',
                            arguments: [workflowPath]
                        }
                    ));

                    if (hasReport) {
                        actions.push(new HistoryItem(
                            '📋 Raporu Aç',
                            'Workflow raporunu aç',
                            vscode.TreeItemCollapsibleState.None,
                            'action',
                            {
                                command: 'vscode.open',
                                title: 'Raporu Aç',
                                arguments: [vscode.Uri.file(reportPath)]
                            }
                        ));
                    } else {
                        actions.push(new HistoryItem(
                            '📋 Rapor Oluştur',
                            'Bu workflow için rapor oluştur',
                            vscode.TreeItemCollapsibleState.None,
                            'action',
                            {
                                command: 'workflowSnapshot.generateReportFromFile',
                                title: 'Rapor Oluştur',
                                arguments: [workflowPath]
                            }
                        ));
                    }

                    actions.push(new HistoryItem(
                        '🗑️ Sil',
                        'Bu workflow\'u sil',
                        vscode.TreeItemCollapsibleState.None,
                        'action',
                        {
                            command: 'workflowSnapshot.deleteWorkflow',
                            title: 'Sil',
                            arguments: [workflowPath]
                        }
                    ));

                    // Alt öğeleri sakla
                    (item as any).children = actions;
                    items.push(item);
                }
            }

            if (items.length === 0) {
                items.push(new HistoryItem(
                    'Henüz workflow kaydı yok',
                    'Kayıt başlatmak için yukarıdaki butonu kullanın',
                    vscode.TreeItemCollapsibleState.None,
                    'empty'
                ));
            }

        } catch (error) {
            console.error('Workflow geçmişi yüklenemedi:', error);
            items.push(new HistoryItem(
                'Hata: Geçmiş yüklenemedi',
                error instanceof Error ? error.message : 'Bilinmeyen hata',
                vscode.TreeItemCollapsibleState.None,
                'error'
            ));
        }

        return items;
    }

    // Alt öğeleri döndürmek için özel method
    async getChildrenForItem(element: HistoryItem): Promise<HistoryItem[]> {
        if (element.contextValue === 'workflow' && (element as any).children) {
            return (element as any).children;
        }
        return [];
    }
}

class HistoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.description = description;
        this.contextValue = contextValue;
        this.command = command;

        // İkonlar
        switch (contextValue) {
            case 'workflow':
                this.iconPath = new vscode.ThemeIcon('history');
                break;
            case 'action':
                this.iconPath = new vscode.ThemeIcon('play');
                break;
            case 'empty':
                this.iconPath = new vscode.ThemeIcon('info');
                break;
            case 'error':
                this.iconPath = new vscode.ThemeIcon('error');
                break;
        }
    }

    // Alt öğeleri getir
    async getChildren(): Promise<HistoryItem[]> {
        if (this.contextValue === 'workflow' && (this as any).children) {
            return (this as any).children;
        }
        return [];
    }
}
