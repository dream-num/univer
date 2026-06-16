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

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export interface IDiscoverUniverUiLocalesOptions {
    rootDir?: string;
    uiPackageDir?: string;
}

function getCandidateUiPackageDirs(rootDir: string): string[] {
    const dirs: string[] = [];
    let current = path.resolve(rootDir);

    while (true) {
        dirs.push(
            path.join(current, 'node_modules/@univerjs/ui'),
            path.join(current, 'packages/ui'),
            path.join(current, 'submodules/univer/packages/ui')
        );

        const parent = path.dirname(current);
        if (parent === current) {
            break;
        }

        current = parent;
    }

    return dirs;
}

function resolveUniverUiPackageDir(options: IDiscoverUniverUiLocalesOptions): string {
    if (options.uiPackageDir) {
        return path.resolve(options.uiPackageDir);
    }

    const rootDir = options.rootDir ?? process.cwd();
    const uiPackageDir = getCandidateUiPackageDirs(rootDir).find((candidate) => existsSync(path.join(candidate, 'src/locale')));

    if (!uiPackageDir) {
        throw new Error(`Cannot find @univerjs/ui src/locale from ${path.resolve(rootDir)}`);
    }

    return uiPackageDir;
}

export function discoverUniverUiLocales(options: IDiscoverUniverUiLocalesOptions = {}): string[] {
    const uiPackageDir = resolveUniverUiPackageDir(options);
    const localeDir = path.join(uiPackageDir, 'src/locale');

    if (!existsSync(localeDir)) {
        throw new Error(`Cannot find @univerjs/ui locale directory: ${localeDir}`);
    }

    return readdirSync(localeDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
        .map((entry) => path.basename(entry.name, '.ts'))
        .sort((left, right) => left.localeCompare(right));
}
