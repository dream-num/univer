import { execSync } from 'node:child_process';
import process from 'node:process';
import esbuild from 'esbuild';
import minimist from 'minimist';
import './scripts/generate-locales.mjs';

const args = minimist(process.argv.slice(2));

const define = {
    'process.env.NODE_ENV': args.watch ? '"development"' : '"production"',
};

if (!args.watch) {
    const gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const gitRefName = execSync('git symbolic-ref -q --short HEAD || git describe --tags --exact-match').toString().trim();

    define['process.env.GIT_COMMIT_HASH'] = `"${gitCommitHash}"`;
    define['process.env.GIT_REF_NAME'] = `"${gitRefName}"`;
    define['process.env.BUILD_TIME'] = `"${new Date().toISOString()}"`;
}

const ctx = await esbuild[args.watch ? 'context' : 'build']({
    bundle: true,
    color: true,
    sourcemap: args.watch,
    minify: false,
    target: 'chrome70',
    entryPoints: [
        './src/cases/basic.ts',
        './src/sdk/worker.ts',
    ],
    platform: 'node',
    outdir: './dist',
    define,
});

if (args.watch) {
    await ctx.watch();
}
