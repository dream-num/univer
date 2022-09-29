import { defineConfig } from 'vite';
import path from 'path';
import legacy from '@vitejs/plugin-legacy';
import { name, version } from './package.json';
import preact from '@preact/preset-vite';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    build: {
        // lib: {
        //     entry: resolve('src/index.ts'),
        //     name: 'BaseWebUI',
        //     formats: ['es', 'umd'],
        //     fileName: 'index',
        // },
        // outDir: './lib',
    },
    define: {
        pkgJson: { name, version },
    },
    esbuild: {
        // jsxFactory: 'DOMcreateElement',
        // jsxFragment: 'DOMcreateFragment',
        // jsxInject: `import { DOMcreateElement, DOMcreateFragment } from '@/dom-helper/jsxFactory';`,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly', // dash to camelCase conversion// .apply-color -> applyColor
        },
    },
    server: {
        port: 3101,
        open: true, // Automatically open the app in the browser on server start.
    },
    plugins: [
        preact(),
        legacy({
            targets: ['ie >= 11'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        }),

        // babel(),
        // babel({ babelHelpers: 'bundled' }),
    ],
});
