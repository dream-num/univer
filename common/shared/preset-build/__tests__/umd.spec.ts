import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createUmdConfig } from '../../tsdown/configs/umd';
import { prependPresetUmd } from '../umd';

const roots: string[] = [];

function makeRoot() {
    const root = mkdtempSync(path.join(os.tmpdir(), 'univer-preset-umd-'));
    roots.push(root);
    return root;
}

afterEach(() => {
    for (const root of roots.splice(0)) {
        rmSync(root, { force: true, recursive: true });
    }
});

describe('prependPresetUmd', () => {
    it('does not externalize CSS imports as UMD globals', () => {
        const config = createUmdConfig({
            baseConfig: {},
            enableObfuscation: false,
            entry: {
                key: 'index',
                path: '/tmp/index.ts',
                type: 'index',
            },
            outDir: 'lib/umd',
            packageDir: '/tmp/pkg',
            packageName: '@univerjs/preset-alpha',
            plugins: [],
        });

        const neverBundle = config.deps!.neverBundle as (source: string) => boolean;
        const globals = config.outputOptions!.globals as (source: string) => string | undefined;

        expect(neverBundle('@univerjs/design/index.css')).toBe(false);
        expect(globals('@univerjs/design/index.css')).toBe('UniverCssNoop');
    });

    it('maps locale dependency imports to dependency UMD locale globals', () => {
        const config = createUmdConfig({
            baseConfig: {},
            enableObfuscation: false,
            entry: {
                key: 'locales/en-US',
                path: '/tmp/locales/en-US.ts',
                type: 'locale',
            },
            outDir: 'lib/umd',
            packageDir: '/tmp/pkg',
            packageName: '@univerjs/preset-alpha',
            plugins: [],
        });

        const neverBundle = config.deps!.neverBundle as (source: string) => boolean;
        const globals = config.outputOptions!.globals as (source: string) => string | undefined;

        expect(neverBundle('@univerjs/design/locale/en-US')).toBe(true);
        expect(globals('@univerjs/design/locale/en-US')).toBe('UniverDesignEnUS');
        expect(globals('@univerjs/sheets/locales/zh-CN')).toBe('UniverSheetsZhCN');
        expect(globals('@univerjs-pro/exchange-client/locales/en-US')).toBe('UniverProExchangeClientEnUS');
    });

    it('prepends additional files and dependency UMD outputs before the preset UMD', () => {
        const packageDir = makeRoot();
        const extraFile = path.join(packageDir, 'extra.js');
        writeFileSync(extraFile, '/* extra */');

        mkdirSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/umd'), { recursive: true });
        mkdirSync(path.join(packageDir, 'node_modules/@univerjs/beta/lib/umd'), { recursive: true });
        mkdirSync(path.join(packageDir, 'lib/umd'), { recursive: true });

        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/umd/index.js'), '/* alpha */');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/umd/facade.js'), '/* alpha facade */');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/beta/lib/umd/index.js'), '/* beta */');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/beta/lib/umd/facade.js'), '/* beta facade */');
        writeFileSync(path.join(packageDir, 'lib/umd/index.js'), '/* preset */');

        prependPresetUmd({
            packageDir,
            umdAdditionalFiles: [extraFile],
            umdDeps: ['@univerjs/alpha', '@univerjs/beta'],
        });

        const output = readFileSync(path.join(packageDir, 'lib/umd/index.js'), 'utf8');
        expect(output.indexOf('/* extra */')).toBeLessThan(output.indexOf('/* alpha */'));
        expect(output.indexOf('/* alpha */')).toBeLessThan(output.indexOf('/* beta */'));
        expect(output.indexOf('/* beta */')).toBeLessThan(output.indexOf('/* alpha facade */'));
        expect(output.indexOf('/* alpha facade */')).toBeLessThan(output.indexOf('/* beta facade */'));
        expect(output.indexOf('/* beta facade */')).toBeLessThan(output.indexOf('/* preset */'));
    });

    it('fails when a declared UMD dependency has not been built', () => {
        const packageDir = makeRoot();
        mkdirSync(path.join(packageDir, 'lib/umd'), { recursive: true });
        writeFileSync(path.join(packageDir, 'lib/umd/index.js'), '/* preset */');

        expect(() => prependPresetUmd({
            packageDir,
            umdDeps: ['@univerjs/missing'],
        })).toThrow('Missing UMD dependency @univerjs/missing');
    });

    it('prepends dependency UMD locale outputs from both locale and locales directories', () => {
        const packageDir = makeRoot();

        mkdirSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/umd/locale'), { recursive: true });
        mkdirSync(path.join(packageDir, 'node_modules/@univerjs/preset-beta/lib/umd/locales'), { recursive: true });
        mkdirSync(path.join(packageDir, 'lib/umd/locales'), { recursive: true });

        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/umd/index.js'), '/* alpha */');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/alpha/lib/umd/locale/en-US.js'), '/* alpha locale */');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/preset-beta/lib/umd/index.js'), '/* beta */');
        writeFileSync(path.join(packageDir, 'node_modules/@univerjs/preset-beta/lib/umd/locales/en-US.js'), '/* beta locales */');
        writeFileSync(path.join(packageDir, 'lib/umd/index.js'), '/* preset */');
        writeFileSync(path.join(packageDir, 'lib/umd/locales/en-US.js'), '/* preset locale */');

        prependPresetUmd({
            packageDir,
            umdDeps: ['@univerjs/alpha', '@univerjs/preset-beta'],
        });

        const output = readFileSync(path.join(packageDir, 'lib/umd/locales/en-US.js'), 'utf8');
        expect(output.indexOf('/* alpha locale */')).toBeLessThan(output.indexOf('/* beta locales */'));
        expect(output.indexOf('/* beta locales */')).toBeLessThan(output.indexOf('/* preset locale */'));
    });
});
