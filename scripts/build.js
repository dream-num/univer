const execa = require('execa');
const os = require('os');
// scripts/build.ts
const { build } = require('esbuild');
const { promises } = require('fs');
const { resolve, join } = require('path');
const { targets: allTargets, covertToPascalCase } = require('./utils');
const { commonBuildOptions, hasFolder } = require('./common');
const { Bright, FgCyan, FgGreen, Reset } = require('./color');

// TODO: run => build d.ts => build esm/umd

run();

async function run() {
    await buildAll(allTargets);
}
// Reference https://github.com/vuejs/vue-next/blob/master/scripts/build.js
async function buildAll(targets) {
    await runParallel(os.cpus().length, targets, buildTarget);
}

async function runParallel(maxConcurrency, source, iteratorFn) {
    const ret = [];
    const executing = [];
    for (const item of source) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (maxConcurrency <= source.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= maxConcurrency) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

async function buildTarget(target) {
    const buildPaths = {
        entry: resolve(__dirname, `../packages/${target}/src/index.ts`),
        // cssEntry: resolve(root, "./src/index.css"),
        index: resolve(__dirname, `../packages/${target}/public/index.html`),
        out: resolve(__dirname, `../packages/${target}/dist`),
        outfile: resolve(__dirname, `../packages/${target}/dist/univer-${target}.js`),
        outDev: resolve(__dirname, `../packages/${target}/local`),
    };

    if (hasFolder(buildPaths.outDev)) {
        promises.rm(buildPaths.out, { recursive: true });
    }

    await build({
        ...commonBuildOptions,
        entryPoints: [buildPaths.entry],
        // outdir: buildPaths.out,
        define: { 'process.env.NODE_ENV': '"production"' },
        format: 'esm',
        globalName: `Univer${covertToPascalCase(target)}`,
        outfile: buildPaths.outfile,
        //   minify: true,
        // outExtension:{'.js':'.cjs'}, // esm => .js, cjs => .cjs, iife => .iife.js
        packages: 'external',
        sourcemap: false,
    });

    console.log(`${FgGreen}Build success: ${Reset}${target}`);
}
