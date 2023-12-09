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

export default defineConfig({
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
                '@univerjs/design',
                '@univerjs/engine-render',
                '@wendellhu/redi',
                '@wendellhu/redi/react-bindings',
                'react',
                'react-dom',
                'rxjs',
            ],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    '@ctrl/tinycolor': 'tinycolor',
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/design': 'UniverDesign',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@wendellhu/redi': '@wendellhu/redi',
                    '@wendellhu/redi/react-bindings': 'react-bindings',
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    rxjs: 'rxjs',
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
});
