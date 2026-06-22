import type { BuildOptions, Plugin, SameShape } from 'esbuild';
import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { ignoreGlobalCssPlugin, removeClassnameNewlinesPlugin } from '@univerjs-infra/shared/esbuild';
import aliasPlugin from 'esbuild-plugin-alias';
import copyPlugin from 'esbuild-plugin-copy';
import vue3 from 'esbuild-plugin-vue3';
import stylePlugin from 'esbuild-style-plugin';
import * as React from 'react';
import tailwindcss from 'tailwindcss';
import { syncDemoArtifacts } from '../sync-demos.mts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeModules = path.resolve(process.cwd(), './node_modules');
const isReact16 = React.version.startsWith('16');

export interface IBuildArgs {
    watch: boolean;
    e2e: boolean;
    all: boolean;
}

export function createEnvDefinitions(args: IBuildArgs): Record<string, string> {
    const define: Record<string, string> = {
        'process.env.NODE_ENV': args.watch ? '"development"' : '"production"',
        'process.env.IS_E2E': args.e2e ? 'true' : 'false',
    };

    if (!args.watch) {
        const gitCommitHash = args.e2e ? 'E2E' : execSync('git rev-parse --short HEAD').toString().trim();
        const gitRefName = args.e2e ? 'E2E' : execSync('git symbolic-ref -q --short HEAD || git describe --tags --exact-match').toString().trim();

        define['process.env.GIT_COMMIT_HASH'] = `"${gitCommitHash}"`;
        define['process.env.GIT_REF_NAME'] = `"${gitRefName}"`;
        define['process.env.BUILD_TIME'] = `"${new Date().toISOString()}"`;
    }

    return define;
}

export async function createBuildConfig(args: IBuildArgs): Promise<SameShape<BuildOptions, BuildOptions>> {
    const isAll = !!args.all;
    let entryPoints: string[];

    if (args.watch && !isAll) {
        const { selectEntries } = await import('../select-entries.mts');
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
                    plugins: [tailwindcss as unknown as { postcssPlugin: string }],
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
        define: createEnvDefinitions(args),
    };

    if (isReact16) {
        config.plugins?.push(
            aliasPlugin({
                'react-dom/client': path.resolve(__dirname, '../../src/client.ts'),
            })
        );
    }

    return config;
}
