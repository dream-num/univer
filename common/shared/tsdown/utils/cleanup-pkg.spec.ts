/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanupPackageJson } from './cleanup-pkg';

function writeJson(filePath: string, value: unknown) {
    writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
}

function readPackageJson(packageDir: string) {
    return JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')) as {
        exports?: Record<string, unknown>;
        publishConfig?: { exports?: Record<string, unknown> };
    };
}

function createPackageDir(packageJson: Record<string, unknown>) {
    const packageDir = mkdtempSync(path.join(tmpdir(), 'univer-cleanup-pkg-'));

    mkdirSync(path.join(packageDir, 'src'), { recursive: true });
    writeFileSync(path.join(packageDir, 'src/index.ts'), 'export const value = 1;\n');
    writeJson(path.join(packageDir, 'package.json'), packageJson);

    return packageDir;
}

describe('cleanupPackageJson publish manifest', () => {
    const packageDirs: string[] = [];

    afterEach(() => {
        while (packageDirs.length > 0) {
            const packageDir = packageDirs.pop();
            if (packageDir) {
                rmSync(packageDir, { force: true, recursive: true });
            }
        }
    });

    it('keeps wildcard publish exports by default', () => {
        const packageJson = {
            name: '@univerjs-pro/default-wildcards',
            version: '0.0.0',
            dependencies: {},
            devDependencies: {},
        };
        const packageDir = createPackageDir(packageJson);
        packageDirs.push(packageDir);

        cleanupPackageJson(packageDir, packageJson);

        const nextPackageJson = readPackageJson(packageDir);

        expect(nextPackageJson.publishConfig?.exports).toHaveProperty('./*');
        expect(nextPackageJson.publishConfig?.exports).toHaveProperty('./lib/*');
    });

    it('omits wildcard publish exports when package opts out', () => {
        const packageJson = {
            name: '@univerjs-pro/explicit-entries',
            version: '0.0.0',
            dependencies: {},
            devDependencies: {},
            univerCli: {
                publishWildcardExports: false,
            },
        };
        const packageDir = createPackageDir(packageJson);
        packageDirs.push(packageDir);

        mkdirSync(path.join(packageDir, 'src/facade'), { recursive: true });
        writeFileSync(path.join(packageDir, 'src/facade/index.ts'), 'export const facade = 1;\n');

        cleanupPackageJson(packageDir, packageJson);

        const nextPackageJson = readPackageJson(packageDir);

        expect(nextPackageJson.publishConfig?.exports).toHaveProperty('.');
        expect(nextPackageJson.publishConfig?.exports).toHaveProperty('./facade');
        expect(nextPackageJson.publishConfig?.exports).toHaveProperty('./lib/facade');
        expect(Object.hasOwn(nextPackageJson.publishConfig?.exports ?? {}, './*')).toBe(false);
        expect(Object.hasOwn(nextPackageJson.publishConfig?.exports ?? {}, './lib/*')).toBe(false);
    });

    it('keeps locale exports explicit when package opts out of wildcard publish exports', () => {
        const packageJson = {
            name: '@univerjs-pro/explicit-locale-entries',
            version: '0.0.0',
            dependencies: {},
            devDependencies: {},
            exports: {
                '.': './src/index.ts',
                './locale/en-US': './src/locale/en-US.ts',
                './locale/zh-CN': './src/locale/zh-CN.ts',
            },
            univerCli: {
                publishWildcardExports: false,
            },
        };
        const packageDir = createPackageDir(packageJson);
        packageDirs.push(packageDir);

        mkdirSync(path.join(packageDir, 'src/locale'), { recursive: true });
        writeFileSync(path.join(packageDir, 'src/locale/en-US.ts'), 'export default {};\n');
        writeFileSync(path.join(packageDir, 'src/locale/zh-CN.ts'), 'export default {};\n');

        cleanupPackageJson(packageDir, packageJson);

        const nextPackageJson = readPackageJson(packageDir);

        expect(nextPackageJson.exports).toHaveProperty('./locale/en-US');
        expect(nextPackageJson.exports).toHaveProperty('./locale/zh-CN');
        expect(nextPackageJson.publishConfig?.exports).toHaveProperty('./locale/en-US');
        expect(nextPackageJson.publishConfig?.exports).toHaveProperty('./locale/zh-CN');
        expect(Object.hasOwn(nextPackageJson.exports ?? {}, './locale/*')).toBe(false);
        expect(Object.hasOwn(nextPackageJson.publishConfig?.exports ?? {}, './locale/*')).toBe(false);
    });

    it('removes stale locale wildcard source exports when opt-out packages no longer have locale files', () => {
        const packageJson = {
            name: '@univerjs-pro/stale-locale-wildcard',
            version: '0.0.0',
            dependencies: {},
            devDependencies: {},
            exports: {
                '.': './src/index.ts',
                './locale/*': './src/locale/*.ts',
            },
            univerCli: {
                publishWildcardExports: false,
            },
        };
        const packageDir = createPackageDir(packageJson);
        packageDirs.push(packageDir);

        cleanupPackageJson(packageDir, packageJson);

        const nextPackageJson = readPackageJson(packageDir);

        expect(nextPackageJson.exports).toHaveProperty('.');
        expect(Object.hasOwn(nextPackageJson.exports ?? {}, './locale/*')).toBe(false);
        expect(Object.hasOwn(nextPackageJson.publishConfig?.exports ?? {}, './locale/*')).toBe(false);
    });
});
