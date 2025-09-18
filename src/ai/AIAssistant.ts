import * as vscode from 'vscode';
import * as path from 'path';
import { WorkflowSession } from '../workflow/types';
import { FileAnalyzer, FileAnalysis, ProjectAnalysis } from './FileAnalyzer';

export class AIAssistant {
    private panel: vscode.WebviewPanel | undefined;
    private fileAnalyzer: FileAnalyzer;

    constructor(private context: vscode.ExtensionContext) {
        this.fileAnalyzer = new FileAnalyzer();
    }

    public openAssistant() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'workflowAI',
            '🤖 Workflow AI Asistanı',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
                ]
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.setupWebviewMessageHandling();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private setupWebviewMessageHandling() {
        if (!this.panel) {
            return;
        }

        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'analyzeWorkflow':
                    // Gerçek workflow verisini al
                    const currentWorkflow = await this.getCurrentWorkflowData();
                    await this.analyzeWorkflow(currentWorkflow);
                    break;
                
                case 'generateSuggestions':
                    // Gerçek workflow verisini al
                    const workflowForSuggestions = await this.getCurrentWorkflowData();
                    if (!workflowForSuggestions) {
                        this.sendMessageToWebview({
                            type: 'suggestionsResult',
                            data: [{
                                title: 'Start Recording',
                                description: 'Begin a workflow session to get personalized suggestions',
                                action: 'start_recording'
                            }]
                        });
                    } else {
                        const suggestions = this.generateRealSuggestions(workflowForSuggestions);
                        this.sendMessageToWebview({
                            type: 'suggestionsResult',
                            data: suggestions
                        });
                    }
                    break;
                
                case 'optimizeWorkflow':
                    await this.optimizeWorkflow(message.workflowData);
                    break;
                
                case 'explainWorkflow':
                    // Gerçek workflow verisini al
                    const workflowForExplain = await this.getCurrentWorkflowData();
                    await this.explainWorkflow(workflowForExplain);
                    break;
            }
        });
    }

    private async getCurrentWorkflowData(): Promise<WorkflowSession | null> {
        // Extension'dan gerçek workflow verisini al
        const extension = vscode.extensions.getExtension('ArslantasM.workflow-snapshot-replay');
        if (extension && extension.isActive) {
            // Extension'ın exports'ından workflow tracker'ı al
            return extension.exports?.getCurrentWorkflow?.() || null;
        }
        return null;
    }

    private async analyzeWorkflow(workflowData: WorkflowSession | null) {
        // Null check ekleyelim
        if (!workflowData || !workflowData.events) {
            this.sendMessageToWebview({
                type: 'analysisResult',
                data: {
                    summary: 'Henüz analiz edilecek workflow verisi yok',
                    insights: ['Önce bir workflow kaydı başlatın'],
                    recommendations: ['Dashboard\'dan "▶️ Kayıt Başlat" butonuna tıklayın']
                }
            });
            return;
        }

        // Gerçek analiz - workflowData.events array'i var
        const analysis = await this.performRealWorkflowAnalysis(workflowData);

        this.sendMessageToWebview({
            type: 'analysisResult',
            data: analysis
        });
    }

    private async performRealWorkflowAnalysis(workflowData: WorkflowSession) {
        const events = workflowData.events;
        const duration = workflowData.endTime ? 
            (workflowData.endTime - workflowData.startTime) / 1000 / 60 : 
            (Date.now() - workflowData.startTime) / 1000 / 60;

        // Dosya bazlı detaylı analiz
        const fileEvents = events.filter(e => e.type.includes('file_') || e.type === 'text_changed');
        const uniqueFiles = new Set<string>();
        
        fileEvents.forEach(event => {
            if (event.data.relativePath) {
                uniqueFiles.add(event.data.relativePath);
            }
        });

        // Her dosyayı ayrı ayrı analiz et
        const fileAnalyses: FileAnalysis[] = [];
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        
        if (workspaceFolder) {
            for (const relativePath of uniqueFiles) {
                const fullPath = path.join(workspaceFolder.uri.fsPath, relativePath);
                try {
                    const analysis = await this.fileAnalyzer.analyzeFile(fullPath);
                    fileAnalyses.push(analysis);
                } catch (error) {
                    console.error(`Could not analyze file: ${relativePath}`, error);
                }
            }
        }

        // Proje seviyesi analiz
        const projectAnalysis = await this.fileAnalyzer.analyzeProject(
            workspaceFolder?.uri.fsPath || '', 
            fileAnalyses
        );

        // Detaylı insights oluştur
        const insights = [];
        const recommendations = [];

        // Genel workflow metrikleri
        insights.push(`Project Type: ${projectAnalysis.projectType}`);
        insights.push(`Architecture: ${projectAnalysis.architecture}`);
        insights.push(`Languages: ${projectAnalysis.languages.join(', ')}`);
        
        if (projectAnalysis.frameworks.length > 0) {
            insights.push(`Frameworks: ${projectAnalysis.frameworks.join(', ')}`);
        }

        // Dosya bazlı detaylar
        fileAnalyses.forEach(file => {
            if (file.codeQuality.score > 0) {
                insights.push(`${file.fileName}: ${file.language}, ${file.lineCount} lines, Quality: ${file.codeQuality.score}/100`);
                
                if (file.functions.length > 0) {
                    insights.push(`  └ Functions: ${file.functions.slice(0, 3).join(', ')}${file.functions.length > 3 ? '...' : ''}`);
                }
                
                if (file.patterns.length > 0) {
                    insights.push(`  └ Patterns: ${file.patterns.join(', ')}`);
                }

                // Dosya bazlı öneriler
                file.suggestions.forEach(suggestion => {
                    recommendations.push(`${file.fileName}: ${suggestion}`);
                });

                // Issues
                file.issues.forEach(issue => {
                    recommendations.push(`${file.fileName}: Fix - ${issue}`);
                });
            }
        });

        // Proje seviyesi öneriler
        if (!projectAnalysis.structure.hasTests) {
            recommendations.push('Project: Add unit tests for better code quality');
        }
        if (!projectAnalysis.structure.hasDocumentation) {
            recommendations.push('Project: Add README.md and documentation');
        }
        if (!projectAnalysis.structure.followsConventions) {
            recommendations.push('Project: Follow naming conventions for consistency');
        }

        // Workflow pattern analizi
        const textChanges = events.filter(e => e.type === 'text_changed');
        const eventsPerMinute = events.length / Math.max(duration, 1);
        
        if (eventsPerMinute > 10) {
            insights.push(`High activity: ${eventsPerMinute.toFixed(1)} events/minute`);
            recommendations.push('Consider taking breaks to maintain focus');
        }

        if (textChanges.length > fileAnalyses.length * 5) {
            insights.push(`High edit frequency: ${(textChanges.length / fileAnalyses.length).toFixed(1)} edits/file`);
            recommendations.push('Plan code structure before implementation');
        }

        return {
            summary: `Analyzed ${fileAnalyses.length} files (${projectAnalysis.totalLines} lines) over ${duration.toFixed(1)} minutes`,
            insights: insights.length > 0 ? insights : ['Basic workflow analysis completed'],
            recommendations: recommendations.length > 0 ? recommendations : ['Code quality looks good!']
        };
    }

    private async generateSuggestions(context: any) {
        // Gerçek workflow verisine dayalı öneriler
        const currentWorkflow = await this.getCurrentWorkflowData();
        if (!currentWorkflow) {
            this.sendMessageToWebview({
                type: 'suggestionsResult',
                data: [{
                    title: 'Start Recording',
                    description: 'Begin a workflow session to get personalized suggestions',
                    action: 'start_recording'
                }]
            });
            return;
        }

        const suggestions = this.generateRealSuggestions(currentWorkflow);

        this.sendMessageToWebview({
            type: 'suggestionsResult',
            data: suggestions
        });
    }

    private generateRealSuggestions(workflowData: WorkflowSession) {
        const events = workflowData.events;
        const suggestions = [];

        // Dosya analizi
        const fileEvents = events.filter(e => e.type.includes('file_'));
        const uniqueFiles = new Set();
        fileEvents.forEach(e => {
            if (e.data.relativePath) {
                uniqueFiles.add(e.data.relativePath);
            }
        });

        // Metin değişiklik analizi
        const textChanges = events.filter(e => e.type === 'text_changed');
        const editFrequency = textChanges.length / Math.max(fileEvents.length, 1);

        // Terminal kullanım analizi
        const terminalEvents = events.filter(e => e.type === 'terminal_opened');

        // Dinamik öneriler
        if (uniqueFiles.size > 10) {
            suggestions.push({
                title: 'File Management',
                description: `Working with ${uniqueFiles.size} files. Consider using workspace organization`,
                action: 'organize_workspace'
            });
        }

        if (editFrequency > 5) {
            suggestions.push({
                title: 'Code Planning',
                description: `High edit frequency (${editFrequency.toFixed(1)} edits/file). Plan before coding`,
                action: 'plan_before_code'
            });
        }

        if (terminalEvents.length === 0) {
            suggestions.push({
                title: 'Terminal Integration',
                description: 'No terminal usage detected. Integrate terminal commands for efficiency',
                action: 'use_terminal'
            });
        }

        // Dosya türü bazlı öneriler
        const jsFiles = Array.from(uniqueFiles).filter((f: any) => f.endsWith('.js') || f.endsWith('.ts'));
        if (jsFiles.length > 0) {
            suggestions.push({
                title: 'JavaScript/TypeScript Tools',
                description: `${jsFiles.length} JS/TS files detected. Setup linting and formatting`,
                action: 'setup_js_tools'
            });
        }

        const mdFiles = Array.from(uniqueFiles).filter((f: any) => f.endsWith('.md'));
        if (mdFiles.length > 0) {
            suggestions.push({
                title: 'Documentation Tools',
                description: `${mdFiles.length} Markdown files detected. Setup preview and linting`,
                action: 'setup_md_tools'
            });
        }

        return suggestions.length > 0 ? suggestions : [{
            title: 'Efficient Workflow',
            description: 'Your workflow looks efficient! Keep up the good work.',
            action: 'continue_good_work'
        }];
    }

    private async optimizeWorkflow(workflowData: WorkflowSession) {
        // Gerçek workflow verisini al
        const currentWorkflow = await this.getCurrentWorkflowData();
        if (!currentWorkflow) {
            this.sendMessageToWebview({
                type: 'optimizationResult',
                data: {
                    duplicateActions: [],
                    inefficiencies: ['No active workflow to optimize'],
                    improvements: ['Start a workflow recording session first']
                }
            });
            return;
        }

        const optimizations = this.performRealOptimizationAnalysis(currentWorkflow);

        this.sendMessageToWebview({
            type: 'optimizationResult',
            data: optimizations
        });
    }

    private performRealOptimizationAnalysis(workflowData: WorkflowSession) {
        const events = workflowData.events;
        const duplicateActions = [];
        const inefficiencies = [];
        const improvements = [];

        // Dosya açma/kapama analizi
        const fileOpenEvents = events.filter(e => e.type === 'editor_opened');
        const fileOpenCounts = new Map<string, number>();
        
        fileOpenEvents.forEach(event => {
            const file = event.data.relativePath;
            if (file) {
                fileOpenCounts.set(file, (fileOpenCounts.get(file) || 0) + 1);
            }
        });

        // Çok açılan dosyaları tespit et
        for (const [file, count] of fileOpenCounts) {
            if (count > 3) {
                duplicateActions.push(`File "${file}" opened ${count} times`);
                improvements.push(`Consider keeping "${file}" open in a tab`);
            }
        }

        // Terminal kullanım analizi
        const terminalEvents = events.filter(e => e.type === 'terminal_opened');
        if (terminalEvents.length > 5) {
            inefficiencies.push(`${terminalEvents.length} terminal sessions opened`);
            improvements.push('Consider using a single terminal with multiple tabs');
        }

        // Metin değişiklik sıklığı
        const textChanges = events.filter(e => e.type === 'text_changed');
        const avgChangesPerFile = textChanges.length / Math.max(fileOpenEvents.length, 1);
        
        if (avgChangesPerFile > 10) {
            inefficiencies.push(`High edit frequency: ${avgChangesPerFile.toFixed(1)} changes per file`);
            improvements.push('Plan code structure before writing');
        }

        // Dosya türü çeşitliliği
        const fileTypes = new Set();
        events.forEach(event => {
            if (event.data.relativePath) {
                const ext = event.data.relativePath.split('.').pop();
                if (ext) fileTypes.add(ext);
            }
        });

        if (fileTypes.size > 5) {
            inefficiencies.push(`Working with ${fileTypes.size} different file types`);
            improvements.push('Focus on one language/technology at a time');
        }

        // Zaman bazlı analiz
        const duration = workflowData.endTime ? 
            (workflowData.endTime - workflowData.startTime) / 1000 / 60 : 
            (Date.now() - workflowData.startTime) / 1000 / 60;

        if (duration > 120) { // 2 saatten fazla
            inefficiencies.push(`Long session detected: ${duration.toFixed(0)} minutes`);
            improvements.push('Take regular breaks to maintain productivity');
        }

        return {
            duplicateActions,
            inefficiencies: inefficiencies.length > 0 ? inefficiencies : ['No major inefficiencies detected'],
            improvements: improvements.length > 0 ? improvements : ['Workflow appears optimized']
        };
    }

    private async explainWorkflow(workflowData: WorkflowSession | null) {
        // Null check ekleyelim
        if (!workflowData || !workflowData.events) {
            this.sendMessageToWebview({
                type: 'explanationResult',
                data: {
                    purpose: 'Henüz açıklanacak workflow verisi yok',
                    steps: [],
                    conclusion: 'Önce bir workflow kaydı başlatın'
                }
            });
            return;
        }

        // Workflow açıklaması
        const explanation = {
            purpose: this.analyzePurpose(workflowData.events),
            steps: workflowData.events.map((event, index) => ({
                step: index + 1,
                description: this.getEventExplanation(event),
                timestamp: new Date(event.timestamp).toLocaleTimeString('en-US')
            })),
            conclusion: this.generateConclusion(workflowData.events)
        };

        this.sendMessageToWebview({
            type: 'explanationResult',
            data: explanation
        });
    }

    private analyzePurpose(events: any[]): string {
        const fileTypes = new Set<string>();
        const patterns = new Set<string>();

        events.forEach(event => {
            if (event.data.relativePath) {
                const ext = path.extname(event.data.relativePath).toLowerCase();
                fileTypes.add(ext);
                
                const fileName = event.data.relativePath.toLowerCase();
                if (fileName.includes('test')) patterns.add('testing');
                if (fileName.includes('api') || fileName.includes('server')) patterns.add('backend development');
                if (fileName.includes('component') || fileName.includes('view')) patterns.add('frontend development');
                if (fileName.includes('model') || fileName.includes('data')) patterns.add('data modeling');
                if (fileName.includes('config') || fileName.includes('setting')) patterns.add('configuration');
            }
        });

        if (fileTypes.has('.py')) {
            if (patterns.has('data modeling')) return 'Python data analysis and modeling project';
            if (patterns.has('testing')) return 'Python testing and quality assurance workflow';
            return 'Python development workflow';
        }
        
        if (fileTypes.has('.js') || fileTypes.has('.ts')) {
            if (patterns.has('frontend development')) return 'Frontend web application development';
            if (patterns.has('backend development')) return 'Backend API development workflow';
            return 'JavaScript/TypeScript development workflow';
        }

        if (fileTypes.has('.md')) return 'Documentation and content creation workflow';
        
        return 'General development workflow';
    }

    private generateConclusion(events: any[]): string {
        const fileEvents = events.filter(e => e.type.includes('file_'));
        const textChanges = events.filter(e => e.type === 'text_changed');
        
        if (textChanges.length > fileEvents.length * 3) {
            return 'Intensive coding session with frequent modifications';
        }
        
        if (fileEvents.length > 5) {
            return 'Multi-file development session with good organization';
        }
        
        if (events.some(e => e.type === 'terminal_opened')) {
            return 'Well-rounded development session with terminal integration';
        }
        
        return 'Focused development session completed successfully';
    }

    private getEventExplanation(event: any): string {
        switch (event.type) {
            case 'file_created':
                return `Created new file: ${event.data.relativePath}`;
            case 'file_modified':
                return `Modified file: ${event.data.relativePath}`;
            case 'text_changed':
                return `Text changes in: ${event.data.relativePath}`;
            case 'editor_opened':
                return `Opened in editor: ${event.data.relativePath}`;
            case 'terminal_opened':
                return `Opened terminal session`;
            case 'session_started':
                return `Started workflow recording session`;
            case 'session_ended':
                return `Ended workflow recording session`;
            default:
                return `${event.type} event occurred`;
        }
    }

    private sendMessageToWebview(message: any) {
        if (this.panel) {
            this.panel.webview.postMessage(message);
        }
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow AI Assistant</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .section {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        .button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .result {
            background: var(--vscode-textCodeBlock-background);
            border-radius: 4px;
            padding: 15px;
            margin-top: 15px;
            font-family: monospace;
        }
        .hidden {
            display: none;
        }
        .insight-item {
            background: var(--vscode-list-inactiveSelectionBackground);
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Workflow AI Assistant</h1>
            <p>Analyze, optimize and get suggestions for your workflows</p>
        </div>

        <div class="section">
            <h2>📊 Analysis Tools</h2>
            <button class="button" onclick="analyzeCurrentWorkflow()">
                Analyze Current Workflow
            </button>
            <button class="button" onclick="generateSuggestions()">
                Get Development Suggestions
            </button>
            <button class="button" onclick="optimizeWorkflow()">
                Optimize Workflow
            </button>
            <button class="button" onclick="explainWorkflow()">
                Explain Workflow
            </button>
        </div>

        <div id="results" class="section hidden">
            <h2>📋 Results</h2>
            <div id="resultContent" class="result"></div>
        </div>

        <div class="section">
            <h2>💡 AI Features</h2>
            <div class="insight-item">
                <strong>🔍 Smart Analysis:</strong> Analyzes your workflows to find ways to improve your productivity
            </div>
            <div class="insight-item">
                <strong>⚡ Optimization:</strong> Detects unnecessary steps and suggests faster working methods
            </div>
            <div class="insight-item">
                <strong>📚 Learning:</strong> Learns from your work habits to provide personalized suggestions
            </div>
            <div class="insight-item">
                <strong>🔄 Replay Optimization:</strong> Determines the most efficient step sequence for replay
            </div>
        </div>

        <div class="section">
            <h2>⚙️ Settings</h2>
            <label>
                <input type="checkbox" id="autoAnalysis"> Enable automatic analysis
            </label><br><br>
            <label>
                AI Model: 
                <select id="aiModel">
                    <option value="local">Local Model</option>
                    <option value="custom">Custom API</option>
                </select>
            </label>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function analyzeCurrentWorkflow() {
            showResults('Analyzing workflow...');
            vscode.postMessage({
                type: 'analyzeWorkflow',
                workflowData: {} // Real workflow data will be fetched by backend
            });
        }

        function generateSuggestions() {
            showResults('Generating suggestions...');
            vscode.postMessage({
                type: 'generateSuggestions',
                context: {}
            });
        }

        function optimizeWorkflow() {
            showResults('Optimizing workflow...');
            vscode.postMessage({
                type: 'optimizeWorkflow',
                workflowData: {}
            });
        }

        function explainWorkflow() {
            showResults('Explaining workflow...');
            vscode.postMessage({
                type: 'explainWorkflow',
                workflowData: {}
            });
        }

        function showResults(message) {
            const resultsDiv = document.getElementById('results');
            const contentDiv = document.getElementById('resultContent');
            
            resultsDiv.classList.remove('hidden');
            contentDiv.innerHTML = message;
        }

        // AI'dan gelen mesajları dinle
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'analysisResult':
                    displayAnalysis(message.data);
                    break;
                case 'suggestionsResult':
                    displaySuggestions(message.data);
                    break;
                case 'optimizationResult':
                    displayOptimizations(message.data);
                    break;
                case 'explanationResult':
                    displayExplanation(message.data);
                    break;
            }
        });

        function displayAnalysis(data) {
            const content = \`
                <h3>📊 Analysis Results</h3>
                <p><strong>Summary:</strong> \${data.summary}</p>
                
                <h4>🔍 Insights:</h4>
                <ul>
                    \${data.insights.map(insight => \`<li>\${insight}</li>\`).join('')}
                </ul>
                
                <h4>💡 Recommendations:</h4>
                <ul>
                    \${data.recommendations.map(rec => \`<li>\${rec}</li>\`).join('')}
                </ul>
            \`;
            document.getElementById('resultContent').innerHTML = content;
        }

        function displaySuggestions(data) {
            const content = \`
                <h3>💡 Development Suggestions</h3>
                \${data.map(suggestion => \`
                    <div class="insight-item">
                        <strong>\${suggestion.title}:</strong> \${suggestion.description}
                    </div>
                \`).join('')}
            \`;
            document.getElementById('resultContent').innerHTML = content;
        }

        function displayOptimizations(data) {
            const content = \`
                <h3>⚡ Optimization Suggestions</h3>
                
                <h4>🔄 Inefficiencies:</h4>
                <ul>
                    \${data.inefficiencies.map(item => \`<li>\${item}</li>\`).join('')}
                </ul>
                
                <h4>✨ Improvements:</h4>
                <ul>
                    \${data.improvements.map(item => \`<li>\${item}</li>\`).join('')}
                </ul>
            \`;
            document.getElementById('resultContent').innerHTML = content;
        }

        function displayExplanation(data) {
            const content = \`
                <h3>📖 Workflow Explanation</h3>
                <p><strong>Purpose:</strong> \${data.purpose}</p>
                
                <h4>📝 Steps:</h4>
                <ol>
                    \${data.steps.map(step => \`
                        <li><strong>\${step.timestamp}:</strong> \${step.description}</li>
                    \`).join('')}
                </ol>
                
                <p><strong>Conclusion:</strong> \${data.conclusion}</p>
            \`;
            document.getElementById('resultContent').innerHTML = content;
        }
    </script>
</body>
</html>`;
    }
}
