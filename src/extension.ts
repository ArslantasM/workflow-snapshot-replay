/*
 * Copyright 2025 Mustafa Barış Arslantaş
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import { WorkflowTracker } from './workflow/WorkflowTracker';
import { WorkflowReporter } from './workflow/WorkflowReporter';
import { WorkflowReplayer } from './workflow/WorkflowReplayer';
import { AIAssistant } from './ai/AIAssistant';
import { WorkflowDashboardProvider } from './providers/WorkflowDashboardProvider';

let workflowTracker: WorkflowTracker;
let workflowReporter: WorkflowReporter;
let workflowReplayer: WorkflowReplayer;
let aiAssistant: AIAssistant;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Workflow Snapshot & Replay extension aktif edildi!');
    vscode.window.showInformationMessage('Workflow Snapshot & Replay extension yüklendi!');

    // Ana sınıfları başlat
    workflowTracker = new WorkflowTracker(context);
    workflowReporter = new WorkflowReporter(context);
    workflowReplayer = new WorkflowReplayer(context);
    aiAssistant = new AIAssistant(context);

    // Dashboard provider'ı kaydet
    const dashboardProvider = new WorkflowDashboardProvider(workflowTracker, context);
    vscode.window.registerTreeDataProvider('workflowDashboard', dashboardProvider);

    // Komutları kaydet
    const commands = [
        vscode.commands.registerCommand('workflowSnapshot.startRecording', () => {
            workflowTracker.startRecording();
            vscode.window.showInformationMessage('Workflow kaydı başlatıldı!');
            dashboardProvider.refresh();
        }),

        vscode.commands.registerCommand('workflowSnapshot.stopRecording', () => {
            workflowTracker.stopRecording();
            vscode.window.showInformationMessage('Workflow kaydı durduruldu!');
            dashboardProvider.refresh();
        }),

        vscode.commands.registerCommand('workflowSnapshot.generateReport', async () => {
            const report = await workflowReporter.generateReport(workflowTracker.getCurrentWorkflow());
            if (report) {
                vscode.window.showInformationMessage('Workflow raporu oluşturuldu!');
                dashboardProvider.refresh();
            }
        }),

        vscode.commands.registerCommand('workflowSnapshot.replayWorkflow', async () => {
            const workflowFile = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'Workflow Files': ['md', 'json'] // eslint-disable-line @typescript-eslint/naming-convention
                },
                title: 'Yeniden oynatılacak workflow dosyasını seçin'
            });

            if (workflowFile && workflowFile[0]) {
                await workflowReplayer.replayWorkflow(workflowFile[0].fsPath);
                vscode.window.showInformationMessage('Workflow yeniden oynatılıyor...');
            }
        }),

        vscode.commands.registerCommand('workflowSnapshot.openAIAssistant', () => {
            aiAssistant.openAssistant();
        }),

        // Ek komutlar
        vscode.commands.registerCommand('workflowSnapshot.generateReportFromFile', async (filePath: string) => {
            try {
                const workflow = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
                const workflowData = JSON.parse(workflow.toString());
                const report = await workflowReporter.generateReport(workflowData);
                if (report) {
                    vscode.window.showInformationMessage('Workflow raporu oluşturuldu!');
                    dashboardProvider.refresh();
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Rapor oluşturulamadı: ${error}`);
            }
        }),

        vscode.commands.registerCommand('workflowSnapshot.deleteWorkflow', async (filePath: string) => {
            const result = await vscode.window.showWarningMessage(
                'Bu workflow\'u silmek istediğinizden emin misiniz?',
                { modal: true },
                'Evet, Sil'
            );

            if (result === 'Evet, Sil') {
                try {
                    await vscode.workspace.fs.delete(vscode.Uri.file(filePath));
                    vscode.window.showInformationMessage('Workflow silindi!');
                    dashboardProvider.refresh();
                } catch (error) {
                    vscode.window.showErrorMessage(`Workflow silinemedi: ${error}`);
                }
            }
        }),

        // Dashboard'dan kullanılan ek komutlar
        vscode.commands.registerCommand('workflowSnapshot.showWorkflowDetails', async (workflowId: string) => {
            // Workflow detaylarını göster
            vscode.window.showInformationMessage(`Workflow detayları: ${workflowId}`);
            // TODO: Detaylı workflow bilgi paneli açabilir
        }),

        vscode.commands.registerCommand('workflowSnapshot.showAllWorkflows', async () => {
            // Tüm workflow'ları listele
            const workflows = await workflowTracker.getWorkflowHistory();
            const items = workflows.map(w => ({
                label: `${new Date(w.startTime).toLocaleString('tr-TR')} (${w.events.length} olay)`,
                detail: w.id,
                workflow: w
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Bir workflow seçin',
                matchOnDetail: true
            });

            if (selected) {
                const choice = await vscode.window.showQuickPick([
                    { label: '🔄 Yeniden Oynat', action: 'replay' },
                    { label: '📋 Rapor Oluştur', action: 'report' },
                    { label: '🗑️ Sil', action: 'delete' }
                ], {
                    placeHolder: 'Ne yapmak istiyorsunuz?'
                });

                if (choice) {
                    switch (choice.action) {
                        case 'replay':
                            // TODO: Workflow replay işlemi
                            vscode.window.showInformationMessage('Workflow yeniden oynatılıyor...');
                            break;
                        case 'report':
                            const report = await workflowReporter.generateReport(selected.workflow);
                            if (report) {
                                vscode.window.showInformationMessage('Rapor oluşturuldu!');
                            }
                            break;
                        case 'delete':
                            // TODO: Workflow silme işlemi
                            vscode.window.showInformationMessage('Workflow silindi!');
                            dashboardProvider.refresh();
                            break;
                    }
                }
            }
        })
    ];

    // Komutları context'e ekle
    commands.forEach(command => context.subscriptions.push(command));

    // Extension başladığında otomatik kayda başla (opsiyonel)
    const config = vscode.workspace.getConfiguration('workflowSnapshot');
    if (config.get('autoStart', false)) {
        workflowTracker.startRecording();
    }

    // AI Assistant için exports
    return {
        getCurrentWorkflow: () => workflowTracker.getCurrentWorkflow(),
        getWorkflowHistory: () => workflowTracker.getWorkflowHistory()
    };
}

export function deactivate() {
    if (workflowTracker) {
        workflowTracker.dispose();
    }
    console.log('Workflow Snapshot & Replay extension deaktif edildi');
}
