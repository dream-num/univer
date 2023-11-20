import path from 'node:path';

import cleanPlugin from 'esbuild-plugin-clean';
import stylePlugin from 'esbuild-style-plugin';

const nodeModules = path.resolve(process.cwd(), './node_modules');

/** @type {import('esbuild').BuildOptions} */
export default {
    bundle: true,
    color: true,
    loader: { '.svg': 'file' },
    sourcemap: false,
    plugins: [
        cleanPlugin({
            patterns: ['./lib'],
        }),
        stylePlugin({
            cssModulesOptions: {
                localsConvention: 'camelCaseOnly',
                generateScopedName: 'univer-[local]',
            },
            renderOptions: {
                lessOptions: {
                    rewriteUrls: 'all',
                    paths: [nodeModules],
                },
            },
        }),
    ],
    entryPoints: ['./src/index.ts'],
    define: { 'process.env.NODE_ENV': '"production"' },
    packages: 'external',
};
