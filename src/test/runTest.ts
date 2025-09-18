import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // Extension development path
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // Test runner path
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // VS Code'u test modunda çalıştır
        await runTests({ 
            extensionDevelopmentPath, 
            extensionTestsPath,
            launchArgs: ['--disable-extensions'] // Diğer extension'ları deaktif et
        });
    } catch (err) {
        console.error('Test çalıştırılamadı:', err);
        process.exit(1);
    }
}

main();
