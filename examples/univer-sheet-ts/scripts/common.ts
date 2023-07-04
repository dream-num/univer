// scripts/common.ts
import { BuildOptions } from 'esbuild';
import stylePlugin from 'esbuild-style-plugin';
import { resolve, join } from 'path';
import { existsSync, lstatSync } from 'fs';

// resolve(__dirname, `../packages/${target}/src/index.ts`)
const root = process.cwd();
export const paths = {
    entry: resolve(root, './src/main.tsx'),
    // cssEntry: resolve(root, "./src/index.css"),
    index: resolve(root, './public/index.html'),
    out: resolve(root, './dist'),
    outDev: resolve(root, './local'),
};

const preactCompatPlugin = {
    name: 'preact-compat',
    setup(build) {
        const preact = join(process.cwd(), 'node_modules', 'preact', 'compat', 'dist', 'compat.module.js');

        build.onResolve({ filter: /^(react-dom|react)$/ }, (args) => ({ path: preact }));
    },
};

export const commonBuildOptions: BuildOptions = {
    entryPoints: [paths.entry],
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
        }),
    ],
};

export function hasFolder(target) {
    if (existsSync(target)) {
        if (lstatSync(target).isDirectory()) {
            return true;
        }
    }
    return false;
}
