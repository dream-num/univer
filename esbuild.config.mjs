import { transformFile } from '@swc/core';
import stylePlugin from 'esbuild-style-plugin';
import { writeFileSync } from 'fs';

/** @type {import('esbuild').BuildOptions} */
export default {
    bundle: true,
    color: true,
    loader: { '.svg': 'file' },
    sourcemap: false,
    plugins: [
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
