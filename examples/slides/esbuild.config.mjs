import path from 'node:path';

import esbuild from 'esbuild';
import cleanPlugin from 'esbuild-plugin-clean';
import copyPlugin from 'esbuild-plugin-copy';
import stylePlugin from 'esbuild-style-plugin';
import minimist from 'minimist';
import { execSync } from 'node:child_process';

const nodeModules = path.resolve(process.cwd(), './node_modules');

const args = minimist(process.argv.slice(2));

// Get git commit hash and ref name
const gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
const gitRefName = execSync('git symbolic-ref -q --short HEAD || git describe --tags --exact-match').toString().trim();

const ctx = await esbuild[args.watch ? 'context' : 'build']({
    bundle: true,
    color: true,
    loader: { '.svg': 'file' },
    sourcemap: true,
    plugins: [
        cleanPlugin({
            patterns: ['./local'],
        }),
        copyPlugin({
            assets: {
                from: ['./public/*'],
                to: ['./'],
            },
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
    entryPoints: ['./src/main.ts'],
    outdir: './local',

    define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.GIT_COMMIT_HASH': `"${gitCommitHash}"`,
        'process.env.GIT_REF_NAME': `"${gitRefName}"`,
        'process.env.BUILD_TIME': `"${new Date().toISOString()}"`,
    },
});

if (args.watch) {
    await ctx.watch();

    const { host, port } = await ctx.serve({
        servedir: './local',
        port: 3004,
    });

    const url = `http://localhost:${port}`;
    console.log(`Local server: ${url}`);
}
