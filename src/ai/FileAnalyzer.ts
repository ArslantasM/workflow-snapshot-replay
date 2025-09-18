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
import * as path from 'path';

export interface FileAnalysis {
    filePath: string;
    fileName: string;
    extension: string;
    language: string;
    size: number;
    lineCount: number;
    complexity: 'low' | 'medium' | 'high';
    patterns: string[];
    functions: string[];
    imports: string[];
    issues: string[];
    suggestions: string[];
    codeQuality: {
        score: number;
        metrics: {
            functionCount: number;
            commentRatio: number;
            duplicateLines: number;
            longFunctions: number;
        };
    };
}

export interface ProjectAnalysis {
    projectType: string;
    architecture: string;
    languages: string[];
    frameworks: string[];
    totalFiles: number;
    totalLines: number;
    complexity: 'low' | 'medium' | 'high';
    structure: {
        hasTests: boolean;
        hasDocumentation: boolean;
        hasConfiguration: boolean;
        followsConventions: boolean;
    };
}

export class FileAnalyzer {
    
    public async analyzeFile(filePath: string): Promise<FileAnalysis> {
        try {
            const uri = vscode.Uri.file(filePath);
            const content = await vscode.workspace.fs.readFile(uri);
            const text = content.toString();
            
            const fileName = path.basename(filePath);
            const extension = path.extname(fileName).toLowerCase();
            const language = this.detectLanguage(extension, text);
            
            return {
                filePath,
                fileName,
                extension,
                language,
                size: content.length,
                lineCount: text.split('\n').length,
                complexity: this.calculateComplexity(text, language),
                patterns: this.detectPatterns(text, language),
                functions: this.extractFunctions(text, language),
                imports: this.extractImports(text, language),
                issues: this.detectIssues(text, language),
                suggestions: this.generateFileSuggestions(text, language, fileName),
                codeQuality: this.analyzeCodeQuality(text, language)
            };
        } catch (error) {
            console.error(`File analysis failed for ${filePath}:`, error);
            return this.createEmptyAnalysis(filePath);
        }
    }

    public async analyzeProject(workspacePath: string, analyzedFiles: FileAnalysis[]): Promise<ProjectAnalysis> {
        const languages = [...new Set(analyzedFiles.map(f => f.language))];
        const extensions = [...new Set(analyzedFiles.map(f => f.extension))];
        
        return {
            projectType: this.detectProjectType(analyzedFiles),
            architecture: this.detectArchitecture(analyzedFiles),
            languages,
            frameworks: this.detectFrameworks(analyzedFiles),
            totalFiles: analyzedFiles.length,
            totalLines: analyzedFiles.reduce((sum, f) => sum + f.lineCount, 0),
            complexity: this.calculateProjectComplexity(analyzedFiles),
            structure: {
                hasTests: this.hasTestFiles(analyzedFiles),
                hasDocumentation: this.hasDocumentation(analyzedFiles),
                hasConfiguration: this.hasConfiguration(analyzedFiles),
                followsConventions: this.checkNamingConventions(analyzedFiles)
            }
        };
    }

    private detectLanguage(extension: string, content: string): string {
        const languageMap: { [key: string]: string } = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.tsx': 'TypeScript React',
            '.jsx': 'JavaScript React',
            '.py': 'Python',
            '.java': 'Java',
            '.cs': 'C#',
            '.cpp': 'C++',
            '.c': 'C',
            '.go': 'Go',
            '.rs': 'Rust',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.swift': 'Swift',
            '.kt': 'Kotlin',
            '.dart': 'Dart',
            '.md': 'Markdown',
            '.html': 'HTML',
            '.css': 'CSS',
            '.scss': 'SCSS',
            '.json': 'JSON',
            '.xml': 'XML',
            '.yaml': 'YAML',
            '.yml': 'YAML'
        };

        return languageMap[extension] || 'Unknown';
    }

    private calculateComplexity(content: string, language: string): 'low' | 'medium' | 'high' {
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
        
        if (nonEmptyLines < 50) return 'low';
        if (nonEmptyLines < 200) return 'medium';
        return 'high';
    }

    private detectPatterns(content: string, language: string): string[] {
        const patterns: string[] = [];
        const lowerContent = content.toLowerCase();

        // Common patterns across languages
        if (lowerContent.includes('class ')) patterns.push('Object-Oriented Programming');
        if (lowerContent.includes('function ') || lowerContent.includes('def ')) patterns.push('Function-based');
        if (lowerContent.includes('async ') || lowerContent.includes('await ')) patterns.push('Asynchronous Programming');
        if (lowerContent.includes('import ') || lowerContent.includes('require(')) patterns.push('Module System');
        if (lowerContent.includes('test') || lowerContent.includes('spec')) patterns.push('Testing');
        if (lowerContent.includes('api') || lowerContent.includes('endpoint')) patterns.push('API Development');
        if (lowerContent.includes('database') || lowerContent.includes('sql')) patterns.push('Database Integration');

        // Language-specific patterns
        switch (language) {
            case 'Python':
                if (lowerContent.includes('pandas')) patterns.push('Data Analysis');
                if (lowerContent.includes('flask') || lowerContent.includes('django')) patterns.push('Web Framework');
                if (lowerContent.includes('numpy') || lowerContent.includes('matplotlib')) patterns.push('Scientific Computing');
                break;
            case 'JavaScript':
            case 'TypeScript':
                if (lowerContent.includes('react')) patterns.push('React Development');
                if (lowerContent.includes('express')) patterns.push('Node.js Backend');
                if (lowerContent.includes('vue')) patterns.push('Vue.js Development');
                break;
        }

        return patterns;
    }

    private extractFunctions(content: string, language: string): string[] {
        const functions: string[] = [];
        const lines = content.split('\n');

        switch (language) {
            case 'JavaScript':
            case 'TypeScript':
                lines.forEach(line => {
                    const functionMatch = line.match(/function\s+(\w+)/);
                    const arrowMatch = line.match(/const\s+(\w+)\s*=\s*\(/);
                    if (functionMatch) functions.push(functionMatch[1]);
                    if (arrowMatch) functions.push(arrowMatch[1]);
                });
                break;
            case 'Python':
                lines.forEach(line => {
                    const match = line.match(/def\s+(\w+)/);
                    if (match) functions.push(match[1]);
                });
                break;
        }

        return functions.slice(0, 10); // Limit to 10 functions
    }

    private extractImports(content: string, language: string): string[] {
        const imports: string[] = [];
        const lines = content.split('\n');

        switch (language) {
            case 'JavaScript':
            case 'TypeScript':
                lines.forEach(line => {
                    const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
                    const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
                    if (importMatch) imports.push(importMatch[1]);
                    if (requireMatch) imports.push(requireMatch[1]);
                });
                break;
            case 'Python':
                lines.forEach(line => {
                    const importMatch = line.match(/import\s+(\w+)/);
                    const fromMatch = line.match(/from\s+(\w+)/);
                    if (importMatch) imports.push(importMatch[1]);
                    if (fromMatch) imports.push(fromMatch[1]);
                });
                break;
        }

        return [...new Set(imports)].slice(0, 15); // Unique imports, limit 15
    }

    private detectIssues(content: string, language: string): string[] {
        const issues: string[] = [];
        const lines = content.split('\n');

        // Common issues
        if (content.length > 10000) issues.push('Large file size - consider splitting');
        if (lines.length > 500) issues.push('Too many lines - refactor needed');
        
        const longLines = lines.filter(line => line.length > 120);
        if (longLines.length > 5) issues.push('Multiple long lines detected');

        // Language-specific issues
        switch (language) {
            case 'Python':
                if (!content.includes('"""') && !content.includes("'''")) {
                    issues.push('Missing docstrings');
                }
                if (content.includes('print(') && !content.includes('logging')) {
                    issues.push('Using print() instead of logging');
                }
                break;
            case 'JavaScript':
            case 'TypeScript':
                if (!content.includes('//') && !content.includes('/*')) {
                    issues.push('No comments found');
                }
                if (content.includes('var ')) {
                    issues.push('Using var instead of let/const');
                }
                break;
        }

        return issues;
    }

    private generateFileSuggestions(content: string, language: string, fileName: string): string[] {
        const suggestions: string[] = [];

        // File-specific suggestions based on content analysis
        switch (language) {
            case 'Python':
                if (!content.includes('if __name__ == "__main__":')) {
                    suggestions.push('Add main guard for script execution');
                }
                if (!content.includes('type hint') && !content.includes(': str') && !content.includes(': int')) {
                    suggestions.push('Add type hints for better code documentation');
                }
                if (content.includes('requests') && !content.includes('try:')) {
                    suggestions.push('Add error handling for HTTP requests');
                }
                break;
            case 'JavaScript':
            case 'TypeScript':
                if (!content.includes('export') && !content.includes('module.exports')) {
                    suggestions.push('Consider making functions exportable');
                }
                if (content.includes('console.log') && fileName !== 'debug.js') {
                    suggestions.push('Replace console.log with proper logging');
                }
                break;
            case 'Markdown':
                if (!content.includes('#')) {
                    suggestions.push('Add headers for better document structure');
                }
                if (content.length < 100) {
                    suggestions.push('Expand documentation with more details');
                }
                break;
        }

        return suggestions;
    }

    private analyzeCodeQuality(content: string, language: string): FileAnalysis['codeQuality'] {
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        const commentLines = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('//') || trimmed.startsWith('#') || 
                   trimmed.startsWith('/*') || trimmed.startsWith('"""');
        });

        const functions = this.extractFunctions(content, language);
        const commentRatio = commentLines.length / Math.max(nonEmptyLines.length, 1);
        
        // Calculate score (0-100)
        let score = 70; // Base score
        if (commentRatio > 0.1) score += 15; // Good comments
        if (functions.length > 0 && functions.length < 20) score += 10; // Good function count
        if (lines.length < 200) score += 5; // Reasonable file size

        return {
            score: Math.min(score, 100),
            metrics: {
                functionCount: functions.length,
                commentRatio: Math.round(commentRatio * 100),
                duplicateLines: this.findDuplicateLines(lines),
                longFunctions: this.countLongFunctions(content, language)
            }
        };
    }

    private findDuplicateLines(lines: string[]): number {
        const lineMap = new Map<string, number>();
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.length > 10) { // Only check meaningful lines
                lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1);
            }
        });

        return Array.from(lineMap.values()).filter(count => count > 1).length;
    }

    private countLongFunctions(content: string, language: string): number {
        // Simple heuristic for long functions
        const functionStarts = this.extractFunctions(content, language);
        return functionStarts.filter(func => {
            // This is a simplified check - in real implementation,
            // we would parse the actual function body
            return content.includes(func) && content.split(func)[1]?.split('\n').length > 20;
        }).length;
    }

    private detectProjectType(files: FileAnalysis[]): string {
        const extensions = files.map(f => f.extension);
        const languages = files.map(f => f.language);

        if (extensions.includes('.py') && files.some(f => f.fileName === 'requirements.txt')) {
            return 'Python Project';
        }
        if (extensions.includes('.js') && files.some(f => f.fileName === 'package.json')) {
            return 'Node.js Project';
        }
        if (extensions.includes('.tsx') || extensions.includes('.jsx')) {
            return 'React Project';
        }
        if (extensions.includes('.java') && files.some(f => f.fileName === 'pom.xml')) {
            return 'Java Maven Project';
        }
        if (extensions.includes('.cs') && files.some(f => f.fileName.endsWith('.csproj'))) {
            return '.NET Project';
        }

        return 'Mixed Project';
    }

    private detectArchitecture(files: FileAnalysis[]): string {
        const hasControllers = files.some(f => f.fileName.toLowerCase().includes('controller'));
        const hasModels = files.some(f => f.fileName.toLowerCase().includes('model'));
        const hasViews = files.some(f => f.fileName.toLowerCase().includes('view') || f.fileName.toLowerCase().includes('component'));
        
        if (hasControllers && hasModels && hasViews) {
            return 'MVC Architecture';
        }
        
        const hasComponents = files.some(f => f.fileName.toLowerCase().includes('component'));
        const hasServices = files.some(f => f.fileName.toLowerCase().includes('service'));
        
        if (hasComponents && hasServices) {
            return 'Component-Service Architecture';
        }

        if (files.some(f => f.fileName.toLowerCase().includes('main') || f.fileName.toLowerCase().includes('app'))) {
            return 'Monolithic Architecture';
        }

        return 'Custom Architecture';
    }

    private detectFrameworks(files: FileAnalysis[]): string[] {
        const frameworks: string[] = [];
        const allContent = files.map(f => f.imports.join(' ')).join(' ').toLowerCase();

        // JavaScript/TypeScript frameworks
        if (allContent.includes('react')) frameworks.push('React');
        if (allContent.includes('vue')) frameworks.push('Vue.js');
        if (allContent.includes('angular')) frameworks.push('Angular');
        if (allContent.includes('express')) frameworks.push('Express.js');
        if (allContent.includes('next')) frameworks.push('Next.js');

        // Python frameworks
        if (allContent.includes('django')) frameworks.push('Django');
        if (allContent.includes('flask')) frameworks.push('Flask');
        if (allContent.includes('fastapi')) frameworks.push('FastAPI');
        if (allContent.includes('pandas')) frameworks.push('Pandas');
        if (allContent.includes('numpy')) frameworks.push('NumPy');

        return frameworks;
    }

    private calculateProjectComplexity(files: FileAnalysis[]): 'low' | 'medium' | 'high' {
        const avgComplexity = files.reduce((sum, f) => {
            const complexityScore = f.complexity === 'low' ? 1 : f.complexity === 'medium' ? 2 : 3;
            return sum + complexityScore;
        }, 0) / files.length;

        if (avgComplexity < 1.5) return 'low';
        if (avgComplexity < 2.5) return 'medium';
        return 'high';
    }

    private hasTestFiles(files: FileAnalysis[]): boolean {
        return files.some(f => 
            f.fileName.toLowerCase().includes('test') || 
            f.fileName.toLowerCase().includes('spec') ||
            f.filePath.includes('/test/') ||
            f.filePath.includes('\\test\\')
        );
    }

    private hasDocumentation(files: FileAnalysis[]): boolean {
        return files.some(f => 
            f.extension === '.md' || 
            f.fileName.toLowerCase() === 'readme.md' ||
            f.fileName.toLowerCase().includes('doc')
        );
    }

    private hasConfiguration(files: FileAnalysis[]): boolean {
        const configFiles = ['package.json', 'requirements.txt', 'pom.xml', 'Cargo.toml', '.gitignore'];
        return files.some(f => configFiles.includes(f.fileName.toLowerCase()));
    }

    private checkNamingConventions(files: FileAnalysis[]): boolean {
        // Simple check for consistent naming
        const jsFiles = files.filter(f => f.language.includes('JavaScript') || f.language.includes('TypeScript'));
        const pyFiles = files.filter(f => f.language === 'Python');

        // Check camelCase for JS/TS
        const jsCamelCase = jsFiles.every(f => {
            const name = f.fileName.replace(f.extension, '');
            return /^[a-z][a-zA-Z0-9]*$/.test(name) || name.includes('-');
        });

        // Check snake_case for Python
        const pySnakeCase = pyFiles.every(f => {
            const name = f.fileName.replace(f.extension, '');
            return /^[a-z][a-z0-9_]*$/.test(name);
        });

        return (jsFiles.length === 0 || jsCamelCase) && (pyFiles.length === 0 || pySnakeCase);
    }

    private createEmptyAnalysis(filePath: string): FileAnalysis {
        const fileName = path.basename(filePath);
        const extension = path.extname(fileName);

        return {
            filePath,
            fileName,
            extension,
            language: 'Unknown',
            size: 0,
            lineCount: 0,
            complexity: 'low',
            patterns: [],
            functions: [],
            imports: [],
            issues: ['Could not analyze file'],
            suggestions: ['Check file permissions and format'],
            codeQuality: {
                score: 0,
                metrics: {
                    functionCount: 0,
                    commentRatio: 0,
                    duplicateLines: 0,
                    longFunctions: 0
                }
            }
        };
    }
}
