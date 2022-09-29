import { defineConfig } from 'vite';
import path from 'path';
import preact from '@preact/preset-vite';
import legacy from '@vitejs/plugin-legacy';
import { name, version } from './package.json';
import createExternal from 'vite-plugin-external';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    build: {
        lib: {
            entry: resolve('src/index.ts'),
            name: 'UniverSheetPluginSpreadsheet',
            formats: ['es', 'umd'],
            fileName: 'univer-base-sheets',
        },
        outDir: './lib',
    },
    define: {
        pkgJson: { name, version },
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly', // dash to camelCase conversion// .apply-color -> applyColor
            generateScopedName: 'univer-[local]', // custom prefix class name
        },
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    server: {
        port: 3103,
        open: true, // Automatically open the app in the browser on server start.
        hmr: true,
    },
    plugins: [
        preact(),
        // legacy({
        //     targets: ['ie >= 11'],
        //     additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        // }),
        createExternal({
            externals: {
                '@univer/core': '@univer/core',
                '@univer/base-render': '@univer/base-render',
                '@univer/style-universheet': '@univer/style-universheet',
                preact: 'preact',
            },
        }),
    ],
    resolve: {
        // preserveSymlinks: true,
        // alias: [
        //     {
        //         find: '@Base',
        //         replacement: path.resolve('..', '/src/Base'),
        //     },
        // ],
        // alias: [
        //     {
        //         find: /^@([^univer].*)$/,
        //         replacement: path.resolve(__dirname, './src/$1'),
        //     },
        // ],
    },
});
