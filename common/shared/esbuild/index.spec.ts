import { describe, expect, it } from 'vitest';
import { ignoreGlobalCssPlugin } from './index';

describe('ignoreGlobalCssPlugin', () => {
    it('ignores package global styles without matching unrelated packages ancestors', () => {
        let resolveGlobalCss: ((args: { importer: string; path: string }) => unknown) | undefined;
        const plugin = ignoreGlobalCssPlugin();

        plugin.setup({
            onResolve(_options, callback) {
                resolveGlobalCss = callback;
            },
            onLoad() {},
        });

        expect(resolveGlobalCss).toBeDefined();
        expect(resolveGlobalCss?.({
            importer: '/repo/univer/packages/design/src/components/Button.tsx',
            path: './global.css',
        })).toMatchObject({ namespace: 'ignore-global-css' });
        expect(resolveGlobalCss?.({
            importer: '/repo/univer/packages-experimental/foo/src/index.ts',
            path: './global.css',
        })).toMatchObject({ namespace: 'ignore-global-css' });
        expect(resolveGlobalCss?.({
            importer: '/repo/packages/univer-rs/submodules/univer-pro/examples/src/embed/demo/main.ts',
            path: '../../global.css',
        })).toBeUndefined();
        expect(resolveGlobalCss?.({
            importer: 'C:\\repo\\univer\\packages\\design\\src\\components\\Button.tsx',
            path: './global.css',
        })).toMatchObject({ namespace: 'ignore-global-css' });
    });
});
