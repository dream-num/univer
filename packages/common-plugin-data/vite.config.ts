import { defineConfig } from 'vite';
import { name, version } from './package.json';
import path from 'path';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    // build: {
    //     lib: {
    //         entry: resolve('src/index.ts'),
    //         name: 'UniverSheet',
    //         formats: ['es', 'umd'],
    //         fileName: 'index',
    //     },
    //     outDir: './lib',
    // },
    define: {
        pkgJson: { name, version },
    },
    esbuild: {
        jsxFactory: 'DOMcreateElement',
        jsxFragment: 'DOMcreateFragment',
        jsxInject: "import { DOMcreateElement, DOMcreateFragment } from '@/Common/jsxFactory'",
    },
    server: {
        port: 3102,
        open: true, // // Automatically open the app in the browser on server start.
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
});
