/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { BuildOptions, Plugin, SameShape } from 'esbuild';
import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { ignoreGlobalCssPlugin, removeClassnameNewlinesPlugin } from '@univerjs-infra/shared/esbuild';
import detect from 'detect-port';
import esbuild from 'esbuild';
import aliasPlugin from 'esbuild-plugin-alias';
import cleanPlugin from 'esbuild-plugin-clean';
import copyPlugin from 'esbuild-plugin-copy';
import vue from 'esbuild-plugin-vue3';
import stylePlugin from 'esbuild-style-plugin';
import minimist from 'minimist';
import React from 'react';
import tailwindcss from 'tailwindcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nodeModules = path.resolve(process.cwd(), './node_modules');

const args = minimist(process.argv.slice(2));
const isE2E = !!args.e2e;
const isReact16 = React.version.startsWith('16');

// User should also config their bundler to build monaco editor's resources for web worker.
const monacoEditorEntryPoints = [
    'vs/language/json/json.worker.js',
    'vs/language/css/css.worker.js',
    'vs/language/html/html.worker.js',
    'vs/language/typescript/ts.worker.js',
    'vs/editor/editor.worker.js',
];

function nodeBuildTask() {
    return esbuild.build({
        bundle: true,
        color: true,
        minify: false,
        target: 'chrome70',
        entryPoints: [
            './src/node/cases/basic.ts',
            './src/node/sdk/worker.ts',
        ],
        platform: 'node',
        outdir: './dist',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
    });
}

/**
 * Build monaco editor's resources for web worker
 */
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

const define = {
    'process.env.NODE_ENV': args.watch ? '"development"' : '"production"',
    'process.env.IS_E2E': isE2E ? 'true' : 'false',
};

if (!args.watch) {
    const gitCommitHash = isE2E ? 'E2E' : execSync('git rev-parse --short HEAD').toString().trim();
    const gitRefName = isE2E ? 'E2E' : execSync('git symbolic-ref -q --short HEAD || git describe --tags --exact-match').toString().trim();

    define['process.env.GIT_COMMIT_HASH'] = `"${gitCommitHash}"`;
    define['process.env.GIT_REF_NAME'] = `"${gitRefName}"`;
    define['process.env.BUILD_TIME'] = `"${new Date().toISOString()}"`;
}

const entryPoints = [
    // homepage
    './src/main.tsx',

    // sheets
    './src/sheets/main.ts',
    './src/sheets/worker.ts',

    // sheets-multi
    './src/sheets-multi/main.tsx',

    // sheets-multi-units
    './src/sheets-multi-units/main.ts',

    // sheets-uniscript
    './src/sheets-uniscript/main.ts',

    // sheets-webcomponent
    './src/sheets-webcomponent/main.tsx',

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

    // mobile sheet
    './src/mobile-s/main.ts',
    './src/mobile-s/worker.ts',
];

const config: SameShape<BuildOptions, BuildOptions> = {
    bundle: true,
    format: 'esm',
    splitting: true,
    color: true,
    loader: { '.svg': 'file', '.ttf': 'file' },
    sourcemap: args.watch,
    minify: false,
    target: 'chrome70',
    plugins: [
        ignoreGlobalCssPlugin(),
        removeClassnameNewlinesPlugin(),
        copyPlugin({
            assets: {
                from: ['./public/**/*'],
                to: ['./'],
            },
        }),
        stylePlugin({
            postcss: {
                plugins: [tailwindcss as any],
            },
            renderOptions: {
                lessOptions: {
                    paths: [nodeModules],
                },
            },
        }),
        vue() as unknown as Plugin,
    ],
    entryPoints,
    outdir: './local',
    define,
};

if (isReact16) {
    config.plugins?.push(
        aliasPlugin({
            'react-dom/client': path.resolve(__dirname, './src/client.ts'),
        })
    );
}

/**
 * Build the project
 */
async function main() {
    await monacoBuildTask();

    if (args.watch) {
        const ctx = await esbuild.context(config);
        await nodeBuildTask();
        await ctx.watch();

        const port = isE2E ? 3000 : await detect(3002);
        await ctx.serve({
            servedir: './local',
            port,
        });

        const url = `http://localhost:${port}`;
        console.log(`Local server: ${url}`);
    } else {
        await esbuild.build(config);
    }
}

main();
