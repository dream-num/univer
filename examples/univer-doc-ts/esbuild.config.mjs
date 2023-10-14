import path from 'node:path';

import esbuild from 'esbuild';
import cleanPlugin from 'esbuild-plugin-clean';
import copyPlugin from 'esbuild-plugin-copy';
import stylePlugin from 'esbuild-style-plugin';
import minimist from 'minimist';

const nodeModules = path.resolve(process.cwd(), './node_modules');

const args = minimist(process.argv.slice(2));

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
    entryPoints: ['./src/main.tsx'],
    outdir: './local',
});

if (args.watch) {
    await ctx.watch();

    const { host, port } = await ctx.serve({
        servedir: './local',
        port: 3003,
    });

    const url = `http://localhost:${port}`;
    console.log(`Local server: ${url}`);
}
