// import * as esbuild from 'esbuild';
// import { promises } from 'fs';
// import { exec } from 'child_process';
// import minimist from 'minimist';
// import { commonBuildOptions, hasFolder, paths } from './common';
// import { Bright, FgCyan, FgGreen, Reset } from './color';
const esbuild = require('esbuild');
const { promises } = require('fs');
const { exec } = require('child_process');
const minimist = require('minimist');
const { resolve, join } = require('path');
const { commonBuildOptions, hasFolder } = require('./common');
const { Bright, FgCyan, FgGreen, Reset } = require('./color');

(async () => {
    const args = minimist(process.argv.slice(2));
    const target = args.t;
    console.info('target====', target);
    const paths = {
        entry: resolve(__dirname, `../examples/univer-${target}-ts/src/main.tsx`),
        // cssEntry: resolve(root, "./src/index.css"),
        index: resolve(__dirname, `../examples/univer-${target}-ts/public/index.html`),
        out: resolve(__dirname, `../examples/univer-${target}-ts/dist`),
        outDev: resolve(__dirname, `../examples/univer-${target}-ts/local`),
    };

    if (hasFolder(paths.outDev)) {
        await promises.rm(paths.outDev, { recursive: true });
    }
    await promises.mkdir(paths.outDev);
    await promises.copyFile(paths.index, `${paths.outDev}/index.html`);

    let ctx = await esbuild.context({
        ...commonBuildOptions,
        entryPoints: [paths.entry],
        outdir: paths.outDev,
    });

    await ctx.watch();

    let { host, port } = await ctx.serve({
        servedir: paths.outDev,
        port: 3002,
    });

    let url = `http://localhost:${port}`;

    console.log(`${Bright}${FgGreen}Local server: ${FgCyan}${url}${Reset}`);

    let start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`);
})();
