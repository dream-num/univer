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
            outDir: 'lib/types',
        }),
    ],
    build: {
        outDir: 'lib',
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: libName,
            fileName: (format) => `${format}/index.js`,
            formats: ['es', 'umd', 'cjs'],
        },
    },
    test: {
        coverage: {
            provider: 'istanbul',
        },
    },
});
