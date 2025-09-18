import * as vscode from 'vscode';
// import * as fs from 'fs-extra'; // VS Code API kullanacağız
import * as path from 'path';
import { WorkflowEvent, WorkflowSession } from './types';

export class WorkflowTracker {
    private isRecording: boolean = false;
    private currentSession: WorkflowSession | null = null;
    private disposables: vscode.Disposable[] = [];
    
    constructor(private context: vscode.ExtensionContext) {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Dosya değişikliklerini izle
        const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*');
        
        fileSystemWatcher.onDidCreate((uri) => {
            if (this.isRecording) {
                this.recordEvent({
                    type: 'file_created',
                    timestamp: Date.now(),
                    data: {
                        path: uri.fsPath,
                        relativePath: vscode.workspace.asRelativePath(uri)
                    }
                });
            }
        });

        fileSystemWatcher.onDidChange((uri) => {
            if (this.isRecording) {
                this.recordEvent({
                    type: 'file_modified',
                    timestamp: Date.now(),
                    data: {
                        path: uri.fsPath,
                        relativePath: vscode.workspace.asRelativePath(uri)
                    }
                });
            }
        });

        fileSystemWatcher.onDidDelete((uri) => {
            if (this.isRecording) {
                this.recordEvent({
                    type: 'file_deleted',
                    timestamp: Date.now(),
                    data: {
                        path: uri.fsPath,
                        relativePath: vscode.workspace.asRelativePath(uri)
                    }
                });
            }
        });

        // Metin editör değişikliklerini izle
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (this.isRecording && event.document.uri.scheme === 'file') {
                this.recordEvent({
                    type: 'text_changed',
                    timestamp: Date.now(),
                    data: {
                        path: event.document.uri.fsPath,
                        relativePath: vscode.workspace.asRelativePath(event.document.uri),
                        changes: event.contentChanges.map(change => ({
                            range: {
                                start: { line: change.range.start.line, character: change.range.start.character },
                                end: { line: change.range.end.line, character: change.range.end.character }
                            },
                            text: change.text,
                            rangeLength: change.rangeLength
                        }))
                    }
                });
            }
        });

        // Aktif editör değişikliklerini izle
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (this.isRecording && editor) {
                this.recordEvent({
                    type: 'editor_opened',
                    timestamp: Date.now(),
                    data: {
                        path: editor.document.uri.fsPath,
                        relativePath: vscode.workspace.asRelativePath(editor.document.uri),
                        language: editor.document.languageId
                    }
                });
            }
        });

        // Terminal komutlarını izle (kısıtlı)
        vscode.window.onDidOpenTerminal((terminal) => {
            if (this.isRecording) {
                this.recordEvent({
                    type: 'terminal_opened',
                    timestamp: Date.now(),
                    data: {
                        name: terminal.name
                    }
                });
            }
        });

        this.disposables.push(fileSystemWatcher);
    }

    public startRecording() {
        if (this.isRecording) {
            vscode.window.showWarningMessage('Zaten bir kayıt devam ediyor!');
            return;
        }

        this.isRecording = true;
        this.currentSession = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            endTime: null,
            events: [],
            workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
            metadata: {
                vscodeVersion: vscode.version,
                extensions: vscode.extensions.all.map(ext => ({
                    id: ext.id,
                    version: ext.packageJSON.version
                }))
            }
        };

        this.recordEvent({
            type: 'session_started',
            timestamp: Date.now(),
            data: {
                workspace: this.currentSession.workspace
            }
        });
    }

    public stopRecording() {
        if (!this.isRecording) {
            vscode.window.showWarningMessage('Aktif bir kayıt bulunmuyor!');
            return;
        }

        this.isRecording = false;
        
        if (this.currentSession) {
            this.currentSession.endTime = Date.now();
            this.recordEvent({
                type: 'session_ended',
                timestamp: Date.now(),
                data: {}
            });

            // Oturumu kaydet
            this.saveSession(this.currentSession);
        }
    }

    private recordEvent(event: WorkflowEvent) {
        if (this.currentSession) {
            this.currentSession.events.push(event);
        }
    }

    private async saveSession(session: WorkflowSession) {
        // Workspace içinde workflow klasörü oluştur
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            console.error('Active workspace not found');
            return;
        }
        
        const workflowDir = vscode.Uri.joinPath(workspaceFolder.uri, 'workflow', 'sessions');
        
        try {
            await vscode.workspace.fs.createDirectory(workflowDir);
        } catch (error) {
            // Directory already exists
        }
        
        const sessionFile = vscode.Uri.joinPath(workflowDir, `${session.id}.json`);
        const content = JSON.stringify(session, null, 2);
        await vscode.workspace.fs.writeFile(sessionFile, Buffer.from(content, 'utf8'));
    }

    private generateSessionId(): string {
        return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public getCurrentWorkflow(): WorkflowSession | null {
        return this.currentSession;
    }

    public isCurrentlyRecording(): boolean {
        return this.isRecording;
    }

    public async getWorkflowHistory(): Promise<WorkflowSession[]> {
        // Workspace içindeki SpecFlow klasöründen oku
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }
        
        const workflowDir = vscode.Uri.joinPath(workspaceFolder.uri, 'SpecFlow', 'workflows');
        
        try {
            const files = await vscode.workspace.fs.readDirectory(workflowDir);
            const workflows: WorkflowSession[] = [];

            for (const [fileName, fileType] of files) {
                if (fileType === vscode.FileType.File && fileName.endsWith('.json')) {
                    try {
                        const fileUri = vscode.Uri.joinPath(workflowDir, fileName);
                        const content = await vscode.workspace.fs.readFile(fileUri);
                        const workflow = JSON.parse(content.toString());
                        workflows.push(workflow);
                    } catch (error) {
                        console.error(`Workflow dosyası okunamadı: ${fileName}`, error);
                    }
                }
            }

            return workflows.sort((a, b) => b.startTime - a.startTime);
        } catch (error) {
            // Directory doesn't exist yet
            return [];
        }
    }

    public dispose() {
        this.disposables.forEach(d => d.dispose());
        if (this.isRecording) {
            this.stopRecording();
        }
    }
}
