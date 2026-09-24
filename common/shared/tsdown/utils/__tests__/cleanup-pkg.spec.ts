import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as ts from 'typescript';
import { expect, it, vi } from 'vitest';

import { cleanupPackageJson } from '../cleanup-pkg';

it('keeps package exports resolvable while updating the manifest', () => {
    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'univer-cleanup-pkg-')));
    const packageDir = path.join(root, 'node_modules/@univerjs/themes');
    const manifestPath = path.join(packageDir, 'package.json');
    const indexPath = path.join(packageDir, 'src/index.ts');
    const localePath = path.join(packageDir, 'src/locale/en-US.ts');
    const manifest = {
        name: '@univerjs/themes',
        version: '1.0.0',
        exports: { '.': './src/index.ts' },
    };
    const resolve = (specifier: string) => ts.resolveModuleName(
        specifier,
        path.join(root, 'consumer.ts'),
        { moduleResolution: ts.ModuleResolutionKind.Bundler },
        ts.sys
    ).resolvedModule?.resolvedFileName;
    const resolutions: (string | undefined)[] = [];
    const writeFileSync = fs.writeFileSync;

    try {
        fs.mkdirSync(path.dirname(localePath), { recursive: true });
        fs.writeFileSync(indexPath, 'export const defaultTheme = {};\n');
        fs.writeFileSync(localePath, 'export default {};\n');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest));

        vi.spyOn(fs, 'writeFileSync').mockImplementation((target, data, options) => {
            // Run the concurrent reader after truncation, before the replacement bytes arrive.
            writeFileSync(target, '');
            resolutions.push(resolve(manifest.name));
            writeFileSync(target, data, options);
        });

        cleanupPackageJson(packageDir, manifest);

        expect(new Set(resolutions)).toEqual(new Set([indexPath]));
        expect(resolve(`${manifest.name}/locale/en-US`)).toBe(localePath);
    } finally {
        vi.restoreAllMocks();
        fs.rmSync(root, { recursive: true, force: true });
    }
});
