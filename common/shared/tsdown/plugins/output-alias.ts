import { cpSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';

interface IBundleOutput {
    fileName?: string;
}

export interface ICreateOutputAliasPluginOptions {
    copyToRoot: boolean;
    keepRootIndexCss: boolean;
    packageDir: string;
}

export function createOutputAliasPlugin(options: ICreateOutputAliasPluginOptions) {
    const { copyToRoot, keepRootIndexCss, packageDir } = options;

    return {
        name: 'create-output-alias',
        writeBundle(outputOptions: { dir?: string }, bundle: Record<string, IBundleOutput>) {
            if (!outputOptions.dir) {
                return;
            }

            const outDir = path.resolve(packageDir, outputOptions.dir);
            const rootDir = path.resolve(outDir, '..');

            for (const output of Object.values(bundle)) {
                if (!output.fileName || output.fileName.endsWith('.map')) {
                    continue;
                }

                const sourcePath = path.join(outDir, output.fileName);

                if (output.fileName.endsWith('.css')) {
                    if (keepRootIndexCss) {
                        const rootCssPath = path.join(rootDir, 'index.css');
                        mkdirSync(path.dirname(rootCssPath), { recursive: true });
                        cpSync(sourcePath, rootCssPath);
                    }

                    if (existsSync(sourcePath)) {
                        unlinkSync(sourcePath);
                    }

                    continue;
                }

                if (!copyToRoot) {
                    continue;
                }

                const targetPath = path.join(rootDir, output.fileName);
                mkdirSync(path.dirname(targetPath), { recursive: true });
                cpSync(sourcePath, targetPath);
            }
        },
    };
}
