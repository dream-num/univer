import { describe, expect, it } from 'vitest';
import { ignoreGlobalCssPlugin } from './index';

function getGlobalCssResolver(): (args: { importer: string; path: string }) => unknown {
    let resolver: ((args: { importer: string; path: string }) => unknown) | undefined;

    ignoreGlobalCssPlugin().setup({
        onResolve(_options, callback) {
            resolver = callback;
        },
        onLoad() {},
    });

    if (!resolver) {
        throw new Error('Expected ignoreGlobalCssPlugin to register a resolver');
    }

    return resolver;
}

describe('ignoreGlobalCssPlugin', () => {
    it('does not ignore an application stylesheet when an ancestor directory is named packages', () => {
        const resolveGlobalCss = getGlobalCssResolver();

        expect(resolveGlobalCss({
            importer: '/workspace/packages/univer-rs/submodules/univer-pro/examples/src/slides-local/main.ts',
            path: '../global.css',
        })).toBeUndefined();
    });

    it.each([
        '/workspace/univer/packages/ui/src/index.ts',
        '/workspace/univer-pro/packages/slides-ui/src/index.ts',
        String.raw`C:\workspace\univer\packages-experimental\ssc\src\index.ts`,
    ])('ignores a workspace package stylesheet from %s', (importer) => {
        const resolveGlobalCss = getGlobalCssResolver();

        expect(resolveGlobalCss({
            importer,
            path: './global.css',
        })).toEqual({
            path: './global.css',
            namespace: 'ignore-global-css',
            pluginData: { importer },
        });
    });
});
