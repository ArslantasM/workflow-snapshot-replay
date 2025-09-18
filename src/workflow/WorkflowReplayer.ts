import * as vscode from 'vscode';
// import * as fs from 'fs-extra'; // VS Code API kullanacağız
import * as path from 'path';
import { WorkflowSession, ReplayStep, WorkflowEvent } from './types';

export class WorkflowReplayer {
    private isReplaying: boolean = false;

    constructor(private context: vscode.ExtensionContext) {}

    public async replayWorkflow(filePath: string): Promise<void> {
        if (this.isReplaying) {
            vscode.window.showWarningMessage('Zaten bir replay işlemi devam ediyor!');
            return;
        }

        try {
            this.isReplaying = true;
            
            let workflow: WorkflowSession;
            
            if (filePath.endsWith('.json')) {
                const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
                workflow = JSON.parse(content.toString());
            } else if (filePath.endsWith('.md')) {
                workflow = await this.parseMarkdownWorkflow(filePath);
            } else {
                throw new Error('Desteklenmeyen dosya formatı. Sadece .json ve .md dosyaları desteklenir.');
            }

            const steps = this.convertWorkflowToSteps(workflow);
            await this.executeSteps(steps);

        } catch (error) {
            vscode.window.showErrorMessage(`Workflow replay hatası: ${error}`);
        } finally {
            this.isReplaying = false;
        }
    }

    private async parseMarkdownWorkflow(filePath: string): Promise<WorkflowSession> {
        const fileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
        const content = fileContent.toString();
        
        // Basit markdown parsing - gerçek implementasyonda daha gelişmiş parsing gerekebilir
        const sessionIdMatch = content.match(/\*\*Oturum ID:\*\* (.+)/);
        const workspaceMatch = content.match(/\*\*Workspace:\*\* (.+)/);
        
        if (!sessionIdMatch || !workspaceMatch) {
            throw new Error('Markdown dosyasından workflow bilgileri çıkarılamadı');
        }

        // Zaman çizelgesinden olayları çıkar
        const timelineRegex = /### \d+\. (\d{2}:\d{2}:\d{2}) - (.+?)(?=\n###|\n##|\n---|\n\*|$)/gs;
        const events = [];
        let match;

        while ((match = timelineRegex.exec(content)) !== null) {
            const [, time, description] = match;
            
            // Açıklamadan event type'ı çıkar
            let eventType: WorkflowEvent['type'] = 'session_started'; // default
            if (description.includes('Dosya oluşturuldu')) {
                eventType = 'file_created';
            } else if (description.includes('Dosya değiştirildi')) {
                eventType = 'file_modified';
            } else if (description.includes('Dosya silindi')) {
                eventType = 'file_deleted';
            } else if (description.includes('Editör açıldı')) {
                eventType = 'editor_opened';
            }

            events.push({
                type: eventType,
                timestamp: Date.now(), // Gerçek timestamp'i markdown'dan çıkarmak zor
                data: { description }
            });
        }

        return {
            id: sessionIdMatch[1],
            startTime: Date.now(),
            endTime: null,
            events,
            workspace: workspaceMatch[1],
            metadata: {
                vscodeVersion: vscode.version,
                extensions: []
            }
        };
    }

    private convertWorkflowToSteps(workflow: WorkflowSession): ReplayStep[] {
        const steps: ReplayStep[] = [];

        workflow.events.forEach(event => {
            switch (event.type) {
                case 'file_created':
                    steps.push({
                        type: 'create_file',
                        description: `Dosya oluştur: ${event.data.relativePath}`,
                        data: {
                            path: event.data.relativePath,
                            content: '' // İçerik bilgisi kayıtlarda yok, boş dosya oluştur
                        },
                        delay: 1000
                    });
                    break;

                case 'file_modified':
                case 'text_changed':
                    steps.push({
                        type: 'modify_file',
                        description: `Dosyayı aç ve düzenle: ${event.data.relativePath}`,
                        data: {
                            path: event.data.relativePath
                        },
                        delay: 2000
                    });
                    break;

                case 'file_deleted':
                    steps.push({
                        type: 'delete_file',
                        description: `Dosyayı sil: ${event.data.relativePath}`,
                        data: {
                            path: event.data.relativePath
                        },
                        delay: 1000
                    });
                    break;

                case 'editor_opened':
                    steps.push({
                        type: 'open_file',
                        description: `Dosyayı aç: ${event.data.relativePath}`,
                        data: {
                            path: event.data.relativePath
                        },
                        delay: 500
                    });
                    break;

                case 'terminal_opened':
                    steps.push({
                        type: 'execute_command',
                        description: `Terminal aç: ${event.data.name}`,
                        data: {
                            command: 'echo "Terminal açıldı"',
                            terminal: event.data.name
                        },
                        delay: 1000
                    });
                    break;
            }
        });

        return steps;
    }

    private async executeSteps(steps: ReplayStep[]): Promise<void> {
        const totalSteps = steps.length;
        
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Workflow Yeniden Oynatılıyor",
            cancellable: true
        }, async (progress, token) => {
            for (let i = 0; i < steps.length; i++) {
                if (token.isCancellationRequested) {
                    break;
                }

                const step = steps[i];
                progress.report({
                    increment: (100 / totalSteps),
                    message: `${i + 1}/${totalSteps}: ${step.description}`
                });

                try {
                    await this.executeStep(step);
                    
                    // Adımlar arası bekleme
                    if (step.delay) {
                        await new Promise(resolve => setTimeout(resolve, step.delay));
                    }
                } catch (error) {
                    vscode.window.showWarningMessage(`Adım atlandı: ${step.description} - Hata: ${error}`);
                }
            }
        });

        vscode.window.showInformationMessage('Workflow yeniden oynatma tamamlandı!');
    }

    private async executeStep(step: ReplayStep): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('Aktif workspace bulunamadı');
        }

        const workspacePath = workspaceFolder.uri.fsPath;

        switch (step.type) {
            case 'create_file':
                const createUri = vscode.Uri.file(path.join(workspacePath, step.data.path));
                const dirUri = vscode.Uri.file(path.dirname(createUri.fsPath));
                
                try {
                    await vscode.workspace.fs.createDirectory(dirUri);
                } catch (error) {
                    // Directory already exists
                }
                
                await vscode.workspace.fs.writeFile(createUri, Buffer.from(step.data.content || '', 'utf8'));
                break;

            case 'open_file':
                const openUri = vscode.Uri.file(path.join(workspacePath, step.data.path));
                try {
                    await vscode.workspace.fs.stat(openUri);
                    const document = await vscode.workspace.openTextDocument(openUri);
                    await vscode.window.showTextDocument(document);
                } catch (error) {
                    // File doesn't exist
                }
                break;

            case 'modify_file':
                const modifyUri = vscode.Uri.file(path.join(workspacePath, step.data.path));
                try {
                    await vscode.workspace.fs.stat(modifyUri);
                    const document = await vscode.workspace.openTextDocument(modifyUri);
                    await vscode.window.showTextDocument(document);
                    // Gerçek değişiklikleri uygulamak için daha gelişmiş logic gerekir
                } catch (error) {
                    // File doesn't exist
                }
                break;

            case 'delete_file':
                const deleteUri = vscode.Uri.file(path.join(workspacePath, step.data.path));
                try {
                    await vscode.workspace.fs.delete(deleteUri);
                } catch (error) {
                    // File doesn't exist or can't be deleted
                }
                break;

            case 'execute_command':
                // Terminal komutu çalıştırma (kısıtlı)
                const terminal = vscode.window.createTerminal(step.data.terminal || 'Replay Terminal');
                terminal.show();
                terminal.sendText(step.data.command);
                break;

            case 'wait':
                await new Promise(resolve => setTimeout(resolve, step.data.duration || 1000));
                break;
        }
    }

    public isCurrentlyReplaying(): boolean {
        return this.isReplaying;
    }
}
