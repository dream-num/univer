import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

import { name } from './package.json';

const libName = name
    .replace('@univerjs/', 'univer-')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export default defineConfig(({ mode }) => ({
    plugins: [
        dts({
            entryRoot: 'src',
            outDir: 'lib/types',
        }),
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
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
                '@univerjs/core',
                '@univerjs/engine-formula',
                '@univerjs/network',
                '@univerjs/sheets',
                '@univerjs/sheets-formula',
                '@univerjs/sheets-numfmt',
                '@wendellhu/redi',
                'rxjs',
            ],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/engine-formula': 'UniverEngineFormula',
                    '@univerjs/network': 'UniverNetwork',
                    '@univerjs/sheets': 'UniverSheets',
                    '@univerjs/sheets-formula': 'UniverSheetsFormula',
                    '@univerjs/sheets-numfmt': 'UniverSheetsNumfmt',
                    '@wendellhu/redi': '@wendellhu/redi',
                    rxjs: 'rxjs',
                },
            },
        },
    },
    test: {
        environment: 'happy-dom', // TODO@jikkai: no need to set this
        coverage: {
            provider: 'istanbul',
        },
    },
}));
