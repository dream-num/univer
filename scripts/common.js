// scripts/common.ts
const stylePlugin = require('esbuild-style-plugin');
const { join } = require('path');
const { existsSync, lstatSync } = require('fs');

/** @type {import('esbuild').BuildOptions} */
const commonBuildOptions = {
    bundle: true,
    color: true,
    loader: {
        '.svg': 'file',
    },
    sourcemap: true,
    alias: {
        react: 'preact/compat',
    },
    plugins: [
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
