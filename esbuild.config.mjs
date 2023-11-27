import { transformFile } from '@swc/core';
import cleanPlugin from 'esbuild-plugin-clean';
import stylePlugin from 'esbuild-style-plugin';
import { writeFileSync } from 'fs';

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
        }),
    ],
    entryPoints: ['./src/index.ts'],
    define: { 'process.env.NODE_ENV': '"production"' },
    packages: 'external',
    logLevel: 'verbose',
};

export async function postBuild(format) {
    const transformOptions = {
        jsc: {
            parser: { syntax: 'ecmascript', tsx: false },
            target: 'es5',
            externalHelpers: false,
        },
        module: { type: 'es6' },
        sourceMaps: false,
        isModule: true,
    };

    const { code } = await transformFile(`${process.cwd()}/lib/${format}/index.js`, transformOptions);

    writeFileSync(`${process.cwd()}/lib/${format}/index.js`, code, 'utf-8');
}
