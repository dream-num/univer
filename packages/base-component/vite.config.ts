import { defineConfig } from 'vite';
import path from 'path';
import preact from '@preact/preset-vite';
import legacy from '@vitejs/plugin-legacy';
import createExternal from 'vite-plugin-external';

import { name, version } from './package.json';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    build: {
        lib: {
            entry: resolve('src/index.ts'),
            name: 'StyleUniverSheet',
            formats: ['es', 'umd', 'cjs'],
            fileName: 'univer-base-component',
        },
        outDir: './lib',
        sourcemap: true
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
        // open: true, // Automatically open the app in the browser on server start.
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
                'css-vars-ponyfill': 'css-vars-ponyfill',
                'react-colorful': 'react-colorful',
                // TODO: build ,still have "new Component$1()).isPureReactComponent"
                preact: 'preact',
                react: 'react',
            },
        }),
    ],
});
