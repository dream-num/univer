import './scripts/generate-locales.mjs';
import path from 'node:path';
import process from 'node:process';

import { execSync } from 'node:child_process';
import esbuild from 'esbuild';
import cleanPlugin from 'esbuild-plugin-clean';
import copyPlugin from 'esbuild-plugin-copy';
import stylePlugin from 'esbuild-style-plugin';
import minimist from 'minimist';
import vue from 'esbuild-plugin-vue3';

const nodeModules = path.resolve(process.cwd(), './node_modules');

const args = minimist(process.argv.slice(2));
const isE2E = !!args.e2e;

// User should also config their bunlder to build monaco editor's resources for web worker.
const monacoEditorEntryPoints = ['vs/language/typescript/ts.worker.js', 'vs/editor/editor.worker.js'];

// Get git commit hash and ref name
const gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
const gitRefName = execSync('git symbolic-ref -q --short HEAD || git describe --tags --exact-match').toString().trim();

function monacoBuildTask() {
    return esbuild.build({
        entryPoints: monacoEditorEntryPoints.map((entry) => `./node_modules/monaco-editor/esm/${entry}`),
        bundle: true,
        color: true,
        target: 'chrome70',
        format: 'iife',
        outbase: './node_modules/monaco-editor/esm/',
        outdir: './local',
        plugins: [
            cleanPlugin({
                patterns: ['./local'],
            }),
        ],
    });
}

const ctx = await esbuild[args.watch ? 'context' : 'build']({
    bundle: true,
    color: true,
    loader: { '.svg': 'file', '.ttf': 'file' },
    sourcemap: args.watch,
    minify: false,
    target: 'chrome70',
    plugins: [
        copyPlugin({
            assets: {
                from: ['./public/**/*'],
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
        vue(),
    ],
    entryPoints: [
        // homepage
        './src/main.tsx',

        // sheets
        './src/sheets/main.ts',
        './src/sheets/worker.ts',

        // sheets-multi
        './src/sheets-multi/main.tsx',

        // sheets-uniscript
        './src/sheets-uniscript/main.ts',

        // docs
        './src/docs/main.ts',

        // docs-uniscript
        './src/docs-uniscript/main.ts',

        // slides
        './src/slides/main.ts',

        // uni
        './src/uni/main.ts',
        './src/uni/worker.ts',
        './src/uni/lazy.ts',

        // uni-home
        './src/uni-home/main.tsx',

        // mobile sheet
        './src/mobile-s/main.ts',
        './src/mobile-s/worker.ts',
    ],

    outdir: './local',

    define: {
        'process.env.NODE_ENV': args.watch ? '"development"' : '"production"',
        'process.env.GIT_COMMIT_HASH': `"${gitCommitHash}"`,
        'process.env.GIT_REF_NAME': `"${gitRefName}"`,
        'process.env.BUILD_TIME': `"${new Date().toISOString()}"`,
        'process.env.IS_E2E': isE2E ? 'true' : 'false',
    },
});

if (args.watch) {
    await monacoBuildTask();
    await ctx.watch();

    const { port } = await ctx.serve({
        servedir: './local',
        port: isE2E ? 3000 : 3002,
    });

    const url = `http://localhost:${port}`;

    // eslint-disable-next-line no-console
    console.log(`Local server: ${url}`);
}
