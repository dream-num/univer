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

import type { BuildOptions, Plugin, PluginBuild, SameShape } from 'esbuild';
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
import vue3 from 'esbuild-plugin-vue3';
import stylePlugin from 'esbuild-style-plugin';
import minimist from 'minimist';
import * as React from 'react';
import tailwindcss from 'tailwindcss';
import { syncDemoArtifacts } from './scripts/sync-demos';

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

const supportsColor = !!process.stdout.isTTY && process.env.NO_COLOR == null;
const ansi = {
    reset: '\x1B[0m',
    bold: '\x1B[1m',
    dim: '\x1B[2m',
    red: '\x1B[31m',
    green: '\x1B[32m',
    yellow: '\x1B[33m',
    blue: '\x1B[34m',
    cyan: '\x1B[36m',
    gray: '\x1B[90m',
    underline: '\x1B[4m',
} as const;

type TLogLevel = 'error' | 'info' | 'ready' | 'recover' | 'watch';

const levelStyleMap: Record<TLogLevel, string[]> = {
    error: [ansi.bold, ansi.red],
    info: [ansi.bold, ansi.blue],
    ready: [ansi.bold, ansi.green],
    recover: [ansi.bold, ansi.cyan],
    watch: [ansi.bold, ansi.yellow],
};

function colorize(text: string, styles: string[]) {
    if (!supportsColor || styles.length === 0) {
        return text;
    }

    return `${styles.join('')}${text}${ansi.reset}`;
}

function formatLabel(level: TLogLevel) {
    return colorize(`[${level}]`, levelStyleMap[level]);
}

function formatMuted(text: string) {
    return colorize(text, [ansi.dim, ansi.gray]);
}

function formatUrl(url: string) {
    return colorize(url, [ansi.bold, ansi.underline, ansi.cyan]);
}

function formatDuration(durationMs: number) {
    if (durationMs < 1000) {
        return `${durationMs}ms`;
    }

    return `${(durationMs / 1000).toFixed(durationMs < 10_000 ? 1 : 0)}s`;
}

function createLogger() {
    function write(level: TLogLevel, message: string, method: 'error' | 'log' = 'log') {
        console[method](`${formatLabel(level)} ${message}`);
    }

    return {
        error(message: string) {
            write('error', message, 'error');
        },
        info(message: string) {
            write('info', message);
        },
        ready(message: string) {
            write('ready', message);
        },
        recover(message: string) {
            write('recover', message);
        },
        watch(message: string) {
            write('watch', message);
        },
        muted(message: string) {
            console.log(formatMuted(message));
        },
        url: formatUrl,
    };
}

const logger = createLogger();

function createWatchStatusPlugin() {
    let serverUrl: string | null = null;
    let hasSuccessfulBuild = false;
    let lastBuildFailed = false;
    let buildStartedAt = 0;

    return {
        plugin: {
            name: 'watch-status',
            setup(build: PluginBuild) {
                build.onStart(() => {
                    buildStartedAt = Date.now();
                });

                build.onEnd((result) => {
                    const duration = formatDuration(Math.max(Date.now() - buildStartedAt, 0));

                    if (result.errors.length > 0) {
                        lastBuildFailed = true;
                        logger.error(`Build failed in ${duration} with ${result.errors.length} error(s). Waiting for changes...`);
                        return;
                    }

                    if (lastBuildFailed) {
                        lastBuildFailed = false;
                        hasSuccessfulBuild = true;
                        logger.recover(
                            serverUrl
                                ? `Build recovered in ${duration}. Local server: ${logger.url(serverUrl)}`
                                : `Build recovered in ${duration}.`
                        );
                        return;
                    }

                    if (!hasSuccessfulBuild) {
                        hasSuccessfulBuild = true;
                        logger.watch(`Initial build completed in ${duration}. Watching for changes...`);
                        return;
                    }

                    logger.watch(`Rebuilt in ${duration}.`);
                });
            },
        } satisfies Plugin,
        setServerUrl(url: string) {
            serverUrl = url;
        },
    };
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

const define: Record<string, string> = {
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

async function createBuildConfig(): Promise<SameShape<BuildOptions, BuildOptions>> {
    const isAll = !!args.all;
    let entryPoints: string[];

    if (args.watch && !isAll) {
        const { selectEntries } = await import('./scripts/select-entries');
        const result = await selectEntries();
        entryPoints = result.entryPoints;
    } else {
        const { entryPoints: eps } = syncDemoArtifacts();
        entryPoints = eps;
    }

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
            vue3() as unknown as Plugin,
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

    return config;
}

/**
 * Build the project
 */
async function main() {
    if (args.watch) {
        logger.info('Starting examples dev server...');
    }

    const config = await createBuildConfig();

    await monacoBuildTask();

    if (args.watch) {
        const watchStatus = createWatchStatusPlugin();
        config.plugins?.push(watchStatus.plugin);

        const ctx = await esbuild.context(config);
        await nodeBuildTask();
        await ctx.watch();

        const port = isE2E ? 3000 : await detect(3002);
        await ctx.serve({
            servedir: './local',
            port,
        });

        const url = `http://localhost:${port}`;
        watchStatus.setServerUrl(url);
        logger.ready(`Local server: ${logger.url(url)}`);
        logger.muted('Watching for file changes. Press Ctrl+C to stop.');
    } else {
        await esbuild.build(config);
    }
}

main().catch((error: unknown) => {
    logger.error('Examples build exited unexpectedly.');
    console.error(error);
    process.exitCode = 1;
});
