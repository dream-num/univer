import * as esbuild from 'esbuild'
import { commonBuildOptions, paths } from "./common";
import { promises } from "fs";


(async () => {

    await promises.rm(paths.outDev, { recursive: true });
    await promises.mkdir(paths.outDev);
    await promises.copyFile(paths.index, `${paths.outDev}/index.html`);
    let ctx = await esbuild.context({
        ...commonBuildOptions,
        outdir: paths.outDev,
        sourcemap: false,
        // jsx: 'transform',
        loader:{
            '.tsx':'jsx'
        }
    })

    await ctx.watch()

    let { host, port } = await ctx.serve({
        servedir: paths.outDev,
    })

    console.log('local server:', host, port);

})();