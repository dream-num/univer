import { describe, expect, it } from 'vitest';
import { ignoreGlobalCssPlugin } from './index';

describe('ignoreGlobalCssPlugin', () => {
    it('ignores package global CSS without swallowing an example entry under an outer packages directory', () => {
        let resolveGlobalCss: ((args: { importer: string; path: string }) => unknown) | undefined;
        const plugin = ignoreGlobalCssPlugin();
        plugin.setup({
            onResolve(options, callback) {
                if (options.filter.test('/global.css')) {
                    resolveGlobalCss = callback;
                }
            },
            onLoad() {},
        });

        expect(resolveGlobalCss).toBeDefined();
        expect(
            resolveGlobalCss?.({
                importer: '/repo/packages/univer-rs/submodules/univer-pro/examples/src/main.ts',
                path: '../global.css',
            })
        ).toBeUndefined();
        expect(
            resolveGlobalCss?.({
                importer: '/repo/packages/univer-rs/submodules/univer-pro/packages/embed-ui/src/index.ts',
                path: './global.css',
            })
        ).toMatchObject({
            namespace: 'ignore-global-css',
        });
        expect(
            resolveGlobalCss?.({
                importer: String.raw`C:\repo\packages\ui\src\index.ts`,
                path: './global.css',
            })
        ).toMatchObject({
            namespace: 'ignore-global-css',
        });
    });
});
