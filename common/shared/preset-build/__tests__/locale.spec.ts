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

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generatePresetLocales } from '../locale';

const roots: string[] = [];

function makeRoot() {
    const root = mkdtempSync(path.join(os.tmpdir(), 'univer-preset-locale-'));
    roots.push(root);
    return root;
}

function writeJson(filePath: string, value: unknown) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
}

afterEach(() => {
    for (const root of roots.splice(0)) {
        rmSync(root, { force: true, recursive: true });
    }
});

describe('generatePresetLocales', () => {
    it('generates locale files from available dependency locales and skips missing locales', () => {
        const packageDir = makeRoot();

        writeJson(path.join(packageDir, 'package.json'), {
            name: '@univerjs/preset-demo',
            dependencies: {
                '@univerjs/alpha': 'workspace:*',
                '@univerjs/beta': 'workspace:*',
                '@univerjs/preset-gamma': 'workspace:*',
            },
        });

        mkdirSync(path.join(packageDir, 'node_modules'), { recursive: true });
        writeFileSync(path.join(packageDir, 'node_modules/.keep'), '');
        mkdirSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/es/locale'), { recursive: true });
        mkdirSync(path.join(packageDir, 'node_modules/@univerjs/beta/lib/es/locale'), { recursive: true });
        mkdirSync(path.join(packageDir, 'node_modules/@univerjs/preset-gamma/src/locales'), { recursive: true });
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/es/locale/en-US.js'), 'export default {};');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/beta/lib/es/locale/en-US.js'), 'export default {};');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/preset-gamma/src/locales/en-US.ts'), 'export default {};');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/es/locale/zh-CN.js'), 'export default {};');

        generatePresetLocales({ packageDir });

        const enUS = readFileSync(path.join(packageDir, 'src/locales/en-US.ts'), 'utf8');
        expect(enUS).toContain("import univerjsalpha from '@univerjs/alpha/locale/en-US';");
        expect(enUS).toContain("import univerjsbeta from '@univerjs/beta/locale/en-US';");
        expect(enUS).toContain("import univerjspresetgamma from '@univerjs/preset-gamma/locales/en-US';");

        const zhCN = readFileSync(path.join(packageDir, 'src/locales/zh-CN.ts'), 'utf8');
        expect(zhCN).toContain("import univerjsalpha from '@univerjs/alpha/locale/zh-CN';");
        expect(zhCN).not.toContain('@univerjs/beta/locale/zh-CN');
    });
});
