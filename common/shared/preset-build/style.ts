import type { IPresetPackageJson } from './types.ts';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function getDependencyDir(packageDir: string, dependencyName: string) {
    return path.join(packageDir, 'node_modules', dependencyName);
}

function getBuiltStyleDependencyCssFiles(packageDir: string, packageJson: IPresetPackageJson) {
    return Object.keys(packageJson.dependencies ?? {})
        .flatMap((dependencyName) => {
            if (!dependencyName.startsWith('@univerjs')) {
                return [];
            }

            const dependencyDir = getDependencyDir(packageDir, dependencyName);
            const sourceGlobalCss = path.join(dependencyDir, 'src/global.css');
            const builtCss = path.join(dependencyDir, 'lib/index.css');

            if (!existsSync(sourceGlobalCss)) {
                return [];
            }

            if (!existsSync(builtCss)) {
                throw new Error(`Missing built CSS for ${dependencyName}. Build dependency packages before building preset CSS.`);
            }

            return [builtCss];
        });
}

function writePresetCss(packageDir: string, cssFiles: string[]) {
    const outputFile = path.join(packageDir, 'lib/index.css');

    mkdirSync(path.dirname(outputFile), { recursive: true });

    const content = cssFiles
        .map((cssFile) => readFileSync(cssFile, 'utf8').trimEnd())
        .filter(Boolean)
        .join('\n');

    writeFileSync(outputFile, `${content}\n`);
}

export async function buildPresetStyles(options: {
    packageDir: string;
    packageJson: IPresetPackageJson;
}) {
    const { packageDir, packageJson } = options;
    const cssFiles = getBuiltStyleDependencyCssFiles(packageDir, packageJson);

    if (cssFiles.length === 0) {
        rmSync(path.join(packageDir, 'lib/index.css'), { force: true });
        return;
    }

    writePresetCss(packageDir, cssFiles);
}
