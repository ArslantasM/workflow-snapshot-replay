import * as assert from 'assert';
import * as vscode from 'vscode';
import { WorkflowTracker } from '../workflow/WorkflowTracker';
import { WorkflowReporter } from '../workflow/WorkflowReporter';

suite('Workflow Snapshot Extension Test Suite', () => {
    vscode.window.showInformationMessage('Test başlatılıyor...');

    test('Extension aktivasyonu', async () => {
        // Extension'ın yüklü olduğunu kontrol et
        const extension = vscode.extensions.getExtension('workflow-snapshot-replay');
        assert.ok(extension);
        
        // Extension'ı aktif et
        await extension?.activate();
        assert.ok(extension?.isActive);
    });

    test('WorkflowTracker oluşturma', () => {
        const mockContext = {
            subscriptions: [],
            globalStorageUri: vscode.Uri.file('/tmp/test')
        } as any;

        const tracker = new WorkflowTracker(mockContext);
        assert.ok(tracker);
        assert.strictEqual(tracker.isCurrentlyRecording(), false);
    });

    test('Kayıt başlatma ve durdurma', () => {
        const mockContext = {
            subscriptions: [],
            globalStorageUri: vscode.Uri.file('/tmp/test')
        } as any;

        const tracker = new WorkflowTracker(mockContext);
        
        // Kayıt başlat
        tracker.startRecording();
        assert.strictEqual(tracker.isCurrentlyRecording(), true);
        
        // Kayıt durdur
        tracker.stopRecording();
        assert.strictEqual(tracker.isCurrentlyRecording(), false);
    });

    test('WorkflowReporter oluşturma', () => {
        const mockContext = {
            subscriptions: [],
            globalStorageUri: vscode.Uri.file('/tmp/test')
        } as any;

        const reporter = new WorkflowReporter(mockContext);
        assert.ok(reporter);
    });

    test('Komutların kayıtlı olması', async () => {
        const commands = await vscode.commands.getCommands(true);
        
        const expectedCommands = [
            'workflowSnapshot.startRecording',
            'workflowSnapshot.stopRecording',
            'workflowSnapshot.generateReport',
            'workflowSnapshot.replayWorkflow',
            'workflowSnapshot.openAIAssistant'
        ];

        expectedCommands.forEach(command => {
            assert.ok(commands.includes(command), `Komut bulunamadı: ${command}`);
        });
    });

    test('Workflow olay kaydetme', () => {
        const mockContext = {
            subscriptions: [],
            globalStorageUri: vscode.Uri.file('/tmp/test')
        } as any;

        const tracker = new WorkflowTracker(mockContext);
        tracker.startRecording();
        
        const workflow = tracker.getCurrentWorkflow();
        assert.ok(workflow);
        assert.ok(workflow.events.length > 0); // session_started olayı
        
        tracker.stopRecording();
    });
});
