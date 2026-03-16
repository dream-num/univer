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

import { existsSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { SOURCE_DIRECTORY } from '../constants';

/**
 * Walks the package source tree and returns whether a given file suffix exists.
 */
export function hasSourceFiles(packageDir: string, extension: string) {
    const sourceDir = path.join(packageDir, SOURCE_DIRECTORY);

    if (!existsSync(sourceDir)) {
        return false;
    }

    const stack = [sourceDir];

    while (stack.length > 0) {
        const currentDir = stack.pop()!;
        const entries = readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }

            if (entry.name.endsWith(extension)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Removes emitted css artifacts before a new build so alias copies stay deterministic.
 */
export function removeCssArtifacts(dir: string) {
    if (!existsSync(dir)) {
        return;
    }

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            removeCssArtifacts(fullPath);
            continue;
        }

        if (entry.name.endsWith('.css')) {
            unlinkSync(fullPath);
        }
    }
}
