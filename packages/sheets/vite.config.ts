import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
import { name } from './package.json';

const libName = name
    .replace('@univerjs/', 'univer-')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export default defineConfig({
    plugins: [
        dts({
            entryRoot: 'src',
            outDir: 'lib/types',
        }),
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        outDir: 'lib',
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: libName,
            fileName: (format) => `${format}/index.js`,
            formats: ['es', 'umd', 'cjs'],
        },
        rollupOptions: {
            external: [
                '@ctrl/tinycolor',
                '@univerjs/core',
                '@univerjs/engine-formula',
                '@univerjs/engine-render',
                '@wendellhu/redi',
                'rxjs',
            ],
            output: {
                globals: {
                    '@ctrl/tinycolor': 'tinycolor',
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/engine-formula': 'UniverEngineFormula',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@wendellhu/redi': '@wendellhu/redi',
                    rxjs: 'rxjs',
                },
            },
        },
    },
    test: {
        coverage: {
            provider: 'istanbul',
        },
    },
});
