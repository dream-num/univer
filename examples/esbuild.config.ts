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
import detect from 'detect-port';
import esbuild from 'esbuild';
import aliasPlugin from 'esbuild-plugin-alias';
import cleanPlugin from 'esbuild-plugin-clean';
import copyPlugin from 'esbuild-plugin-copy';
import vue from 'esbuild-plugin-vue3';
import stylePlugin from 'esbuild-style-plugin';
import glob from 'fast-glob';
import fs from 'fs-extra';
import minimist from 'minimist';
import React from 'react';
import tailwindcss from 'tailwindcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LINK_TO_LIB = process.env.LINK_TO_LIB === 'true';
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

/**
 * fix `import '@univerjs/xxx/lib/index.css'` not work on source code dev mode
 *
 * The `stylePlugin` must be loaded after the `skipLibCssEsbuildPlugin`.
 */
const skipLibCssEsbuildPlugin = {
    name: 'skip-lib-css-esbuild-plugin',
    setup(build) {
        console.log('[skip-lib-css-esbuild-plugin] enabled, resolve will skip `import \'@univerjs/xxx/lib/**/*.css\'`');

        build.onResolve({ filter: /\/lib\/.*\.css$/ }, async (args) => {
            if (args.path.includes('@univerjs/')) {
                return {
                    path: args.path,
                    namespace: 'univer-lib-css',
                };
            }
        });

        build.onLoad({ filter: /.*/, namespace: 'univer-lib-css' }, async () => {
            // return virtual css content
            return {
                contents: '',
                loader: 'css',
            };
        });
    },
};

/**
 * Add this function to generate aliases
 */
function generateAliases() {
    const aliases = {};
    const packagesRoots = ['packages', 'packages-experimental'].map((dir) =>
        path.resolve(__dirname, '..', dir)
    );

    for (const packagesRoot of packagesRoots) {
        if (!fs.existsSync(packagesRoot)) continue;

        // Find all package.json files in subdirectories
        const packageJsonPaths = glob.sync('*/package.json', { cwd: packagesRoot });

        for (const packageJsonPath of packageJsonPaths) {
            const pkgDir = path.join(packagesRoot, path.dirname(packageJsonPath));
            const pkgJson = fs.readJSONSync(path.join(packagesRoot, packageJsonPath));
            const exportsConfig = pkgJson.publishConfig?.exports;

            if (!exportsConfig) continue;

            // Add main package alias
            if (exportsConfig['.']) {
                aliases[pkgJson.name] = path.resolve(pkgDir, exportsConfig['.'].import);
            }

            const getValue = (val: { import: string } | string) => {
                if (typeof val === 'string') {
                    return val;
                }
                return val.import;
            };
            // Add subpath aliases
            Object.entries(exportsConfig as Record<string, { import: string } | string>).forEach(([key, value]) => {
                try {
                    if (key === '.') {
                        aliases[pkgJson.name] = path.resolve(pkgDir, exportsConfig['.'].import);
                    } else if (key === './lib/*') {
                        const cssFile = path.resolve(pkgDir, getValue(value).replace('*', 'index.css'));
                        if (fs.existsSync(cssFile)) {
                            aliases[`${pkgJson.name}/lib/index.css`] = cssFile;
                        }
                    } else if (key === './*') {
                        // do nothing
                    } else if (key === './locale/*') {
                        const locales = ['en-US', 'fr-FR', 'ru-RU', 'zh-CN', 'zh-TW', 'vi-VN', 'fa-IR'];
                        locales.forEach((lang) => {
                            aliases[`${pkgJson.name}/locale/${lang}`] = path.resolve(pkgDir, getValue(value).replace('*', lang));
                        });
                    } else {
                        const aliasKey = `${pkgJson.name}/${key.replace('./', '')}`;
                        const aliasPath = path.resolve(pkgDir, getValue(value));
                        aliases[aliasKey] = aliasPath;
                    }
                } catch (e) {
                    console.error(`Error generating aliases for ${pkgJson.name}: ${e.message}`);
                    process.exit(1);
                }
            });
        }
    }

    return aliases;
}

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
        {
            name: 'ignore-global-css',
            setup(build) {
                build.onResolve({ filter: /\/global\.css$/ }, (args) => {
                    if (args.importer.includes('packages')) {
                        return {
                            path: args.path,
                            namespace: 'ignore-global-css',
                            pluginData: {
                                importer: args.importer,
                            },
                        };
                    }
                });

                build.onLoad({ filter: /\/global\.css$/, namespace: 'ignore-global-css' }, () => {
                    return { contents: '' };
                });
            },
        },
        copyPlugin({
            assets: {
                from: ['./public/**/*'],
                to: ['./'],
            },
        }),
        ...(LINK_TO_LIB ? [] : [skipLibCssEsbuildPlugin]),
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
    alias: LINK_TO_LIB ? generateAliases() : {},
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
