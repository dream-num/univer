// scripts/common.ts
// import stylePlugin from 'esbuild-style-plugin';
// import { resolve, join } from 'path';
// import { existsSync, lstatSync } from 'fs';
const stylePlugin = require('esbuild-style-plugin');
const { join } = require('path');
const { existsSync, lstatSync } = require('fs');

// resolve(__dirname, `../packages/${target}/src/index.ts`)
// const root = process.cwd();

const preactCompatPlugin = {
    name: 'preact-compat',
    setup(build) {
        // const preact = join(process.cwd(), 'node_modules', 'preact', 'compat', 'dist', 'compat.module.js');
        const preact = join(process.cwd(), 'node_modules', '.pnpm', 'preact@10.12.1', 'node_modules', 'preact', 'compat', 'dist', 'compat.module.js');

        build.onResolve({ filter: /^(react-dom|react)$/ }, (args) => ({ path: preact }));
    },
};

const commonBuildOptions = {
    bundle: true,
    color: true,
    loader: {
        '.svg': 'file',
    },
    sourcemap: true,
    plugins: [
        preactCompatPlugin,
        stylePlugin({
            cssModulesOptions: {
                localsConvention: 'camelCaseOnly',
                generateScopedName: 'univer-[local]',
            },
            renderOptions: {
                lessOptions: { rewriteUrls: 'all' },
            },
        }),
    ],
};

function hasFolder(target) {
    if (existsSync(target)) {
        if (lstatSync(target).isDirectory()) {
            return true;
        }
    }
    return false;
}

exports.commonBuildOptions = commonBuildOptions;
exports.hasFolder = hasFolder;
