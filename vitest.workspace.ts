import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { defineWorkspace } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findVitestConfigs(): string[] {
    const baseDirs = [
        path.resolve(__dirname, './packages'),
        path.resolve(__dirname, './packages-experimental'),
        path.resolve(__dirname, './tests'),
    ];

    const vitestConfigPaths: string[] = [];

    function traverseDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const packageJsonPath = path.join(fullPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const viteConfigPath = path.join(fullPath, 'vitest.config.ts');
                    if (fs.existsSync(viteConfigPath)) {
                        vitestConfigPaths.push(viteConfigPath);
                    }
                } else {
                    traverseDir(fullPath);
                }
            }
        }
    }

    for (const baseDir of baseDirs) {
        if (fs.existsSync(baseDir)) {
            traverseDir(baseDir);
        }
    }

    return vitestConfigPaths;
}

export default defineWorkspace(findVitestConfigs());
