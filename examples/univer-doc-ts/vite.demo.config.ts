import { defineConfig } from 'vite';
import path from 'path';
import preact from '@preact/preset-vite';
import legacy from '@vitejs/plugin-legacy';
import { name, version } from '../../packages/base-sheets/package.json';
import createExternal from 'vite-plugin-external';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    base: '',
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
            },
        },
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
    // resolve: {
    //     alias: [
    //         {
    //             find: '@',
    //             replacement: path.resolve(__dirname, './node_modules')
    //         }
    //     ],
    // },
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
                // '@univerjs/core': '@univerjs/core',
                // '@univerjs/base-render': '@univerjs/base-render',
                // '@univerjs/base-ui': '@univerjs/base-ui',
                // '@univerjs/style-univer': '@univerjs/style-univer',
                // 'css-vars-ponyfill': 'css-vars-ponyfill',
                // preact: 'preact',
                // react: 'react',
            },
        }),
    ],
    resolve: {
        // preserveSymlinks: true,
        // alias: [
        //     {
        //         find: '@Basics',
        //         replacement: path.resolve('..', '/src/Basics'),
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
