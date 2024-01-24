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
        minify: false,
        rollupOptions: {
            external: ['@univerjs/core', '@wendellhu/redi', 'rxjs', 'rxjs/operators'],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@wendellhu/redi': '@wendellhu/redi',
                    rxjs: 'rxjs',
                    'rxjs/operators': 'rxjs.operators',
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
