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

import type { IEntryConfig } from '../types';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_ENTRY_FILE, FACADE_ENTRY_FILE, LOCALE_DIRECTORY } from '../constants';

/**
 * Collects all canonical build entries for a package.
 */
export function getEntries(packageDir: string): IEntryConfig[] {
    const entries: IEntryConfig[] = [{
        key: 'index',
        path: path.join(packageDir, DEFAULT_ENTRY_FILE),
        type: 'index',
    }];

    const facadeEntry = path.join(packageDir, FACADE_ENTRY_FILE);
    if (existsSync(facadeEntry)) {
        entries.push({
            key: 'facade',
            path: facadeEntry,
            type: 'facade',
        });
    }

    const localeDir = path.join(packageDir, LOCALE_DIRECTORY);
    if (!existsSync(localeDir)) {
        return entries;
    }

    for (const fileName of readdirSync(localeDir).sort((left, right) => left.localeCompare(right))) {
        const fullPath = path.join(localeDir, fileName);

        if (statSync(fullPath).isDirectory() || !fileName.endsWith('.ts') || !fileName.includes('-')) {
            continue;
        }

        entries.push({
            key: `locale/${fileName.replace(/\.ts$/, '')}`,
            path: fullPath,
            type: 'locale',
        });
    }

    return entries;
}
