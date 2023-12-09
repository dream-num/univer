import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { name } from './package.json';
import { viteExternalsPlugin } from 'vite-plugin-externals'

const libName = name
    .replace('@univerjs/', 'univer-')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export default defineConfig({
    plugins: [
        react(),
        dts({
            outDir: 'lib/types',
        }),
        viteExternalsPlugin({
            '@univerjs/core': 'UniverCore',
            '@univerjs/design': 'UniverDesign',
            '@univerjs/sheets': 'UniverSheets',
            '@univerjs/sheets-ui': 'UniverSheetsUi',
            '@univerjs/ui': 'UniverUi',
            'react': 'React',
            'monaco-editor': 'monaco',
            'rxjs': 'rxjs',
            '@wendellhu/redi': '@wendellhu/redi',
        }),
    ],
    resolve: {
        alias: [
            {
                find: /^monaco-editor$/,
                replacement: __dirname + '/node_modules/monaco-editor/esm/vs/editor/editor.api',
            },
        ],
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
            generateScopedName: 'univer-[local]',
        },
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
            output: {
                assetFileNames: 'index.css',
            },
        },
    },
    test: {
        environment: 'happy-dom',
        coverage: {
            provider: 'istanbul',
        },
    },
});
