import type { ObfuscatorOptions } from 'javascript-obfuscator';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import JavaScriptObfuscator from 'javascript-obfuscator';

interface IBundleOutput {
    fileName?: string;
}

export function createOutputObfuscatorPlugin(ignorePatterns?: RegExp[]) {
    const obfuscationOptions: ObfuscatorOptions = {
        ignoreImports: true,
    };

    return {
        name: 'create-output-obfuscator',
        writeBundle(outputOptions: { dir?: string }, bundle: Record<string, IBundleOutput>) {
            if (!outputOptions.dir) {
                return;
            }

            const outDir = outputOptions.dir;

            for (const output of Object.values(bundle)) {
                const fileName = output.fileName;
                if (!fileName || !fileName.endsWith('.js') || fileName.endsWith('.map')) {
                    continue;
                }

                if (ignorePatterns?.some((pattern) => pattern.test(fileName))) {
                    continue;
                }

                const targetPath = path.resolve(outDir, fileName);
                const sourceCode = readFileSync(targetPath, 'utf8');
                const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, obfuscationOptions).getObfuscatedCode();

                writeFileSync(targetPath, obfuscatedCode, 'utf8');
            }
        },
    };
}
