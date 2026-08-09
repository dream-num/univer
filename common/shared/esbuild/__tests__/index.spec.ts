// TODO(@ai-review): Confirm these path fixtures cover the nested-worktree layout without weakening package-owned global CSS filtering.
import { describe, expect, it } from 'vitest';
import { ignoreGlobalCssPlugin } from '../index';

describe('ignoreGlobalCssPlugin', () => {
    it('preserves example global CSS below a parent packages directory', () => {
        let resolveGlobalCss: ((args: { importer: string; path: string }) => unknown) | undefined;
        const plugin = ignoreGlobalCssPlugin();

        plugin.setup({
            onResolve(_options, callback) {
                resolveGlobalCss = callback;
            },
            onLoad() {},
        });

        expect(resolveGlobalCss?.({
            importer: '/workspace/packages/univer-rs/submodules/univer-pro/examples/src/docs-advanced/main.ts',
            path: '../global.css',
        })).toBeUndefined();
        expect(resolveGlobalCss?.({
            importer: '/workspace/packages/univer-rs/submodules/univer-pro/packages/docs-ui/src/index.ts',
            path: './global.css',
        })).toMatchObject({
            namespace: 'ignore-global-css',
        });
    });
});
