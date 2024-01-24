import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { name } from './package.json';

const libName = name
    .replace('@univerjs/', 'univer-')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
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
                '@univerjs/engine-render',
                '@univerjs/ui',
                '@wendellhu/redi',
            ],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@univerjs/ui': 'UniverUi',
                    '@wendellhu/redi': '@wendellhu/redi',
                },
            },
        },
    },
    test: {
        coverage: {
            provider: 'istanbul',
        },
    },
}));
