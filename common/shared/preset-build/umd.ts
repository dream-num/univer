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

import type { IPrependPresetUmdOptions } from './types';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PRESET_LOCALES, PRESET_UMD_OUTPUT_DIR } from './constants';

function readRequiredFile(filePath: string, label: string) {
    if (!existsSync(filePath)) {
        throw new Error(`Missing ${label}: ${filePath}`);
    }

    return readFileSync(filePath, 'utf8');
}

function getDependencyDir(packageDir: string, dependencyName: string) {
    return path.join(packageDir, 'node_modules', dependencyName);
}

function getDependencyLocaleUmdFile(packageDir: string, dependencyName: string, locale: string) {
    const dependencyDir = getDependencyDir(packageDir, dependencyName);
    const localeFile = path.join(dependencyDir, 'lib/umd/locale', `${locale}.js`);

    if (existsSync(localeFile)) {
        return {
            filePath: localeFile,
            label: `${dependencyName}/locale/${locale}`,
        };
    }

    const localesFile = path.join(dependencyDir, 'lib/umd/locales', `${locale}.js`);

    if (existsSync(localesFile)) {
        return {
            filePath: localesFile,
            label: `${dependencyName}/locales/${locale}`,
        };
    }

    return null;
}

function prependFile(outputFile: string, chunks: Array<[string, string]>) {
    if (!existsSync(outputFile)) {
        return;
    }

    const ownContent = readFileSync(outputFile, 'utf8');
    const content = [
        ...chunks.map(([label, value]) => `// ${label}\n${value}`),
        `// index\n${ownContent}`,
    ].join('\n\n');

    writeFileSync(outputFile, content);
}

export function prependPresetUmd(options: IPrependPresetUmdOptions): void {
    const { packageDir, umdAdditionalFiles = [], umdDeps = [] } = options;
    const outputDir = path.join(packageDir, PRESET_UMD_OUTPUT_DIR);
    const rootOutput = path.join(outputDir, 'index.js');
    const rootChunks: Array<[string, string]> = [];
    const rootFacadeChunks: Array<[string, string]> = [];

    for (const file of umdAdditionalFiles) {
        rootChunks.push([file, readRequiredFile(file, `additional UMD file ${file}`)]);
    }

    for (const dependencyName of umdDeps) {
        const dependencyDir = getDependencyDir(packageDir, dependencyName);
        const dependencyUmd = path.join(dependencyDir, 'lib/umd/index.js');
        const dependencyFacade = path.join(dependencyDir, 'lib/umd/facade.js');

        rootChunks.push([
            `${dependencyName}/index`,
            readRequiredFile(dependencyUmd, `UMD dependency ${dependencyName}`),
        ]);

        if (existsSync(dependencyFacade)) {
            rootFacadeChunks.push([
                `${dependencyName}/facade`,
                readFileSync(dependencyFacade, 'utf8'),
            ]);
        }
    }

    prependFile(rootOutput, [...rootChunks, ...rootFacadeChunks]);

    for (const locale of PRESET_LOCALES) {
        const localeOutput = path.join(outputDir, 'locales', `${locale}.js`);

        if (!existsSync(localeOutput)) {
            continue;
        }

        const localeChunks: Array<[string, string]> = [];

        for (const dependencyName of umdDeps) {
            const dependencyLocaleFile = getDependencyLocaleUmdFile(packageDir, dependencyName, locale);

            if (dependencyLocaleFile !== null) {
                localeChunks.push([
                    dependencyLocaleFile.label,
                    readFileSync(dependencyLocaleFile.filePath, 'utf8'),
                ]);
            }
        }

        prependFile(localeOutput, localeChunks);
    }
}
