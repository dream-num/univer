import { resolve } from 'path';
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
                '@ctrl/tinycolor',
                '@univerjs/core',
                '@univerjs/engine-render',
                '@univerjs/sheets',
                '@univerjs/ui',
                '@wendellhu/redi',
                '@wendellhu/redi/react-bindings',
                'react',
                'rxjs',
            ],
            output: {
                globals: {
                    '@ctrl/tinycolor': 'tinycolor',
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@univerjs/sheets': 'UniverSheets',
                    '@univerjs/ui': 'UniverUi',
                    '@wendellhu/redi': '@wendellhu/redi',
                    '@wendellhu/redi/react-bindings': 'react-bindings',
                    react: 'React',
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
}));
