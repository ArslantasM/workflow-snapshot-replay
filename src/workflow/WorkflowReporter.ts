import * as vscode from 'vscode';
// import * as fs from 'fs-extra'; // VS Code API kullanacağız
import * as path from 'path';
import { WorkflowSession, WorkflowReport, WorkflowEvent } from './types';

export class WorkflowReporter {
    constructor(private context: vscode.ExtensionContext) {}

    public async generateReport(session: WorkflowSession | null): Promise<string | null> {
        if (!session) {
            vscode.window.showErrorMessage('Aktif bir workflow oturumu bulunamadı!');
            return null;
        }

        const report = this.analyzeWorkflow(session);
        const markdown = this.generateMarkdownReport(report);
        
        // Workspace içinde SpecFlow/reports klasörü oluştur
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('Aktif workspace bulunamadı!');
            return null;
        }
        
        const reportsDir = vscode.Uri.joinPath(workspaceFolder.uri, 'SpecFlow', 'reports');
        
        try {
            await vscode.workspace.fs.createDirectory(reportsDir);
        } catch (error) {
            // Directory already exists
        }
        
        const reportFile = vscode.Uri.joinPath(reportsDir, `workflow_report_${session.id}.md`);
        await vscode.workspace.fs.writeFile(reportFile, Buffer.from(markdown, 'utf8'));
        
        // Raporu VS Code'da aç
        const document = await vscode.workspace.openTextDocument(reportFile);
        await vscode.window.showTextDocument(document);
        
        return reportFile.fsPath;
    }

    private analyzeWorkflow(session: WorkflowSession): WorkflowReport {
        const filesModified = new Set<string>();
        const commandsExecuted: WorkflowEvent[] = [];
        const timeline: Array<{
            timestamp: number;
            description: string;
            type: string;
            details?: any;
        }> = [];

        session.events.forEach(event => {
            switch (event.type) {
                case 'file_created':
                case 'file_modified':
                case 'file_deleted':
                    if (event.data.relativePath) {
                        filesModified.add(event.data.relativePath);
                    }
                    timeline.push({
                        timestamp: event.timestamp,
                        description: this.getEventDescription(event),
                        type: event.type,
                        details: event.data
                    });
                    break;
                
                case 'text_changed':
                    if (event.data.relativePath) {
                        filesModified.add(event.data.relativePath);
                    }
                    timeline.push({
                        timestamp: event.timestamp,
                        description: `Metin değişikliği: ${event.data.relativePath}`,
                        type: event.type,
                        details: {
                            path: event.data.relativePath,
                            changesCount: event.data.changes?.length || 0
                        }
                    });
                    break;
                
                case 'editor_opened':
                    timeline.push({
                        timestamp: event.timestamp,
                        description: `Editör açıldı: ${event.data.relativePath}`,
                        type: event.type,
                        details: event.data
                    });
                    break;
                
                case 'terminal_opened':
                    timeline.push({
                        timestamp: event.timestamp,
                        description: `Terminal açıldı: ${event.data.name}`,
                        type: event.type,
                        details: event.data
                    });
                    break;
                
                case 'command_executed':
                    commandsExecuted.push(event);
                    timeline.push({
                        timestamp: event.timestamp,
                        description: `Komut çalıştırıldı: ${event.data.command}`,
                        type: event.type,
                        details: event.data
                    });
                    break;
            }
        });

        const duration = session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime;

        return {
            session,
            summary: {
                duration,
                filesModified: filesModified.size,
                commandsExecuted: commandsExecuted.length,
                totalEvents: session.events.length
            },
            timeline: timeline.sort((a, b) => a.timestamp - b.timestamp)
        };
    }

    private getEventDescription(event: WorkflowEvent): string {
        switch (event.type) {
            case 'file_created':
                return `Dosya oluşturuldu: ${event.data.relativePath}`;
            case 'file_modified':
                return `Dosya değiştirildi: ${event.data.relativePath}`;
            case 'file_deleted':
                return `Dosya silindi: ${event.data.relativePath}`;
            case 'session_started':
                return 'Workflow oturumu başlatıldı';
            case 'session_ended':
                return 'Workflow oturumu sonlandırıldı';
            default:
                return `Bilinmeyen olay: ${event.type}`;
        }
    }

    private generateMarkdownReport(report: WorkflowReport): string {
        const startDate = new Date(report.session.startTime);
        const endDate = report.session.endTime ? new Date(report.session.endTime) : new Date();
        const durationMinutes = Math.round(report.summary.duration / 1000 / 60);

        return `# 🔄 Workflow Raporu

## 📊 Oturum Bilgileri

- **Oturum ID:** ${report.session.id}
- **Başlangıç:** ${startDate.toLocaleString('tr-TR')}
- **Bitiş:** ${endDate.toLocaleString('tr-TR')}
- **Süre:** ${durationMinutes} dakika
- **Workspace:** ${report.session.workspace}

## 📈 Özet İstatistikler

- **Toplam Olay:** ${report.summary.totalEvents}
- **Değiştirilen Dosya:** ${report.summary.filesModified}
- **Çalıştırılan Komut:** ${report.summary.commandsExecuted}

## 🕒 Zaman Çizelgesi

${report.timeline.map((item, index) => {
    const time = new Date(item.timestamp).toLocaleTimeString('tr-TR');
    return `### ${index + 1}. ${time} - ${item.description}

${item.details ? this.formatDetails(item.details) : ''}
`;
}).join('\n')}

## 🔧 Teknik Detaylar

- **VS Code Sürümü:** ${report.session.metadata.vscodeVersion}
- **Aktif Extension Sayısı:** ${report.session.metadata.extensions.length}

## 🎯 Yeniden Oynatma Talimatları

Bu workflow'u yeniden oynatmak için aşağıdaki adımları izleyebilirsiniz:

1. Aynı workspace'i açın: \`${report.session.workspace}\`
2. Extension'ın "Workflow'u Yeniden Oynat" komutunu kullanın
3. Bu rapor dosyasını seçin

---

*Bu rapor Workflow Snapshot & Replay extension'ı tarafından otomatik olarak oluşturulmuştur.*
*Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}*
`;
    }

    private formatDetails(details: any): string {
        if (typeof details === 'object') {
            return '```json\n' + JSON.stringify(details, null, 2) + '\n```\n';
        }
        return `\`${details}\`\n`;
    }

    public async getReportHistory(): Promise<string[]> {
        // Workspace içindeki SpecFlow/reports klasöründen oku
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }
        
        const reportsDir = vscode.Uri.joinPath(workspaceFolder.uri, 'SpecFlow', 'reports');
        
        try {
            const files = await vscode.workspace.fs.readDirectory(reportsDir);
            const reportFiles: string[] = [];

            for (const [fileName, fileType] of files) {
                if (fileType === vscode.FileType.File && fileName.endsWith('.md')) {
                    const filePath = vscode.Uri.joinPath(reportsDir, fileName);
                    reportFiles.push(filePath.fsPath);
                }
            }

            // Dosya adına göre sırala (en yeni önce)
            return reportFiles.sort((a, b) => {
                const nameA = path.basename(a);
                const nameB = path.basename(b);
                return nameB.localeCompare(nameA);
            });
        } catch (error) {
            return [];
        }
    }
}
