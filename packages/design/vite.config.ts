import { resolve } from 'path';
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
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
            generateScopedName: 'univer-[local]',
        },
    },
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
            external: ['clsx', 'react', 'react-dom'],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    clsx: 'clsx',
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
    test: {
        environment: 'happy-dom',
        coverage: {
            provider: 'istanbul',
        },
    },
}));
