import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
    // Mocha test runner oluştur
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((c, e) => {
        glob('**/**.test.js', { cwd: testsRoot }, (err: any, files: string[]) => {
            if (err) {
                return e(err);
            }

            // Test dosyalarını Mocha'ya ekle
            files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

            try {
                // Testleri çalıştır
                mocha.run(failures => {
                    if (failures > 0) {
                        e(new Error(`${failures} test başarısız oldu.`));
                    } else {
                        c();
                    }
                });
            } catch (err) {
                console.error(err);
                e(err);
            }
        });
    });
}
