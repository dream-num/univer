import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createTailwindContent } from '../tailwind.config';

const roots: string[] = [];

function makePackageRoot() {
    const root = mkdtempSync(path.join(os.tmpdir(), 'univer-tailwind-content-'));
    roots.push(root);
    writeFileSync(path.join(root, 'tailwind.config.ts'), '');
    return root;
}

function writeJson(filePath: string, value: unknown) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
}

function writeGlobalCss(packageRoot: string, dependencyName: string) {
    const cssPath = path.join(packageRoot, 'node_modules', dependencyName, 'src/global.css');
    mkdirSync(path.dirname(cssPath), { recursive: true });
    writeFileSync(cssPath, '');
}

afterEach(() => {
    for (const root of roots.splice(0)) {
        rmSync(root, { force: true, recursive: true });
    }
});

describe('createTailwindContent', () => {
    it('returns current package source content by default', () => {
        const packageRoot = makePackageRoot();
        writeJson(path.join(packageRoot, 'package.json'), {
            name: '@univerjs/preset-demo',
            dependencies: {
                '@univerjs/design': 'workspace:*',
            },
        });
        writeGlobalCss(packageRoot, '@univerjs/design');

        expect(createTailwindContent(path.join(packageRoot, 'tailwind.config.ts'))).toEqual([
            './src/**/*.{js,ts,jsx,tsx}',
        ]);
    });

    it('includes Univer dependencies with global styles when requested', () => {
        const packageRoot = makePackageRoot();
        writeJson(path.join(packageRoot, 'package.json'), {
            name: '@univerjs/preset-demo',
            dependencies: {
                '@univerjs/sheets-ui': 'workspace:*',
                '@univerjs/design': 'workspace:*',
                '@univerjs/core': 'workspace:*',
                '@univerjs-pro/sheets-chart-ui': 'workspace:*',
                react: '^18.3.1',
            },
        });
        writeGlobalCss(packageRoot, '@univerjs/sheets-ui');
        writeGlobalCss(packageRoot, '@univerjs/design');
        writeGlobalCss(packageRoot, '@univerjs-pro/sheets-chart-ui');

        expect(createTailwindContent(path.join(packageRoot, 'tailwind.config.ts'), {
            includeStyleDependencies: true,
        })).toEqual([
            './src/**/*.{js,ts,jsx,tsx}',
            './node_modules/@univerjs/design/src/**/*.{js,ts,jsx,tsx}',
            './node_modules/@univerjs/sheets-ui/src/**/*.{js,ts,jsx,tsx}',
            './node_modules/@univerjs-pro/sheets-chart-ui/src/**/*.{js,ts,jsx,tsx}',
        ]);
    });
});
