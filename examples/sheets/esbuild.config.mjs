import path from 'node:path';

import esbuild from 'esbuild';
import cleanPlugin from 'esbuild-plugin-clean';
import copyPlugin from 'esbuild-plugin-copy';
import stylePlugin from 'esbuild-style-plugin';
import minimist from 'minimist';
import { execSync } from 'node:child_process';

const nodeModules = path.resolve(process.cwd(), './node_modules');

const args = minimist(process.argv.slice(2));

// User should also config their bunlder to build monaco editor's resources for web worker.
const monacoEditorEntryPoints = ['vs/language/typescript/ts.worker.js', 'vs/editor/editor.worker.js'];

// Get git commit hash and ref name
const gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
const gitRefName = execSync('git symbolic-ref -q --short HEAD || git describe --tags --exact-match').toString().trim();

const monacoBuildTask = () =>
    esbuild.build({
        entryPoints: monacoEditorEntryPoints.map((entry) => `./node_modules/monaco-editor/esm/${entry}`),
        bundle: true,
        color: true,
        format: 'iife',
        outbase: './node_modules/monaco-editor/esm/',
        outdir: './local',
        plugins: [
            cleanPlugin({
                patterns: ['./local'],
            }),
        ],
    });

const ctx = await esbuild[args.watch ? 'context' : 'build']({
    bundle: true,
    color: true,
    loader: { '.svg': 'file', '.ttf': 'file' },
    sourcemap: true,
    plugins: [
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
    entryPoints: ['./src/main.ts', './src/worker.ts'],
    outdir: './local',

    define: {
        'process.env.GIT_COMMIT_HASH': `"${gitCommitHash}"`,
        'process.env.GIT_REF_NAME': `"${gitRefName}"`,
        'process.env.BUILD_TIME': `"${new Date().toISOString()}"`,
    },
});

if (args.watch) {
    await monacoBuildTask();
    await ctx.watch();

    const { host, port } = await ctx.serve({
        servedir: './local',
        port: 3002,
    });

    const url = `http://localhost:${port}`;
    console.log(`Local server: ${url}`);
}
