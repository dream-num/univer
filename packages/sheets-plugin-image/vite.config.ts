import { defineConfig } from 'vite';
import { name, version } from './package.json';
import path from 'path';
import preact from '@preact/preset-vite';
import createExternal from 'vite-plugin-external';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    build: {
        lib: {
            entry: resolve('src/index.ts'),
            name: 'UniverSheetsPluginImage',
            formats: ['es', 'umd', 'cjs'],
            fileName: 'univer-sheets-plugin-image',
        },
        outDir: './lib',
    },
    define: {
        pkgJson: { name, version },
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
            generateScopedName: 'univer-[local]',
        },
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    server: {
        port: 3103,
        open: true,
    },
    plugins: [
        preact(),
        createExternal({
            externals: {
                '@univerjs/core': '@univerjs/core',
                '@univerjs/style-univer': '@univerjs/style-univer',
                preact: 'preact',
                react: 'react',
            },
        }),
    ],
});
