/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { UserConfig } from 'tsdown';
import type { IPresetPackageJson } from './types';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, build as tsdownBuild } from 'tsdown';
import { createOutputAliasPlugin } from '../tsdown/plugins/output-alias';

const PRESET_STYLE_TEMP_DIR = '.preset-build';
const PRESET_STYLE_OUTPUT_DIR = 'lib/.preset-style';

function getDependencyDir(packageDir: string, dependencyName: string) {
    return path.join(packageDir, 'node_modules', dependencyName);
}

function getStyleDependencyNames(packageDir: string, packageJson: IPresetPackageJson) {
    return Object.keys(packageJson.dependencies ?? {})
        .filter((dependencyName) => {
            if (!dependencyName.startsWith('@univerjs')) {
                return false;
            }

            return existsSync(path.join(getDependencyDir(packageDir, dependencyName), 'src/global.css'));
        })
        .sort((left, right) => left.localeCompare(right));
}

function normalizePath(filePath: string) {
    return filePath.split(path.sep).join('/');
}

function writeStyleEntry(packageDir: string, dependencyNames: string[]) {
    const tempDir = path.join(packageDir, PRESET_STYLE_TEMP_DIR);
    const entryFile = path.join(tempDir, 'style.ts');

    mkdirSync(tempDir, { recursive: true });

    const content = dependencyNames
        .map((dependencyName) => {
            const dependencyCss = normalizePath(path.join(getDependencyDir(packageDir, dependencyName), 'src/global.css'));
            return `import ${JSON.stringify(dependencyCss)};`;
        })
        .join('\n');

    writeFileSync(entryFile, `${content}\n`);

    return entryFile;
}

function cleanup(packageDir: string) {
    rmSync(path.join(packageDir, PRESET_STYLE_TEMP_DIR), { force: true, recursive: true });
    rmSync(path.join(packageDir, PRESET_STYLE_OUTPUT_DIR), { force: true, recursive: true });
}

export async function buildPresetStyles(options: {
    baseConfig: Partial<UserConfig>;
    packageDir: string;
    packageJson: IPresetPackageJson;
    plugins: any[];
}) {
    const { baseConfig, packageDir, packageJson, plugins } = options;
    const dependencyNames = getStyleDependencyNames(packageDir, packageJson);

    if (dependencyNames.length === 0) {
        rmSync(path.join(packageDir, 'lib/index.css'), { force: true });
        return;
    }

    const entryFile = writeStyleEntry(packageDir, dependencyNames);

    try {
        await tsdownBuild(defineConfig({
            ...baseConfig,
            dts: false,
            entry: { index: entryFile },
            format: 'esm',
            outDir: PRESET_STYLE_OUTPUT_DIR,
            outputOptions: {
                entryFileNames: '[name].js',
                minify: true,
            },
            plugins: [
                ...plugins,
                createOutputAliasPlugin({
                    copyToRoot: false,
                    keepRootIndexCss: true,
                    packageDir,
                }),
            ],
        }));
    } finally {
        cleanup(packageDir);
    }
}
