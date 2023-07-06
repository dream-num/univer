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
const { commonBuildOptions, hasFolder, paths } = require('./common');
const { Bright, FgCyan, FgGreen, Reset } = require('./color');

(async () => {
    const args = minimist(process.argv.slice(2));
    const target = args.t;
    if (hasFolder(paths.outDev)) {
        await promises.rm(paths.outDev, { recursive: true });
    }
    await promises.mkdir(paths.outDev);
    await promises.copyFile(paths.index, `${paths.outDev}/index.html`);

    let ctx = await esbuild.context({
        ...commonBuildOptions,
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
