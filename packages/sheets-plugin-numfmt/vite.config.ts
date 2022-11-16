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
            name: 'UniverSheetPluginImage',
            formats: ['es', 'umd'],
            fileName: 'univer-sheets-plugin-formula',
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
                '@univer/core': '@univer/core',
                '@univer/style-universheet': '@univer/style-universheet',
                preact: 'preact',
                react: 'react',
            },
        }),
    ],
});
