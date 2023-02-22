import * as esbuild from 'esbuild'
import { commonBuildOptions, hasFolder, paths } from "./common";
import { promises } from "fs";


(async () => {

    if (hasFolder(paths.outDev)) {
        await promises.rm(paths.outDev, { recursive: true });
    }
    await promises.mkdir(paths.outDev);
    await promises.copyFile(paths.index, `${paths.outDev}/index.html`);
    let ctx = await esbuild.context({
        ...commonBuildOptions,
        outdir: paths.outDev,
        sourcemap: false,
    })

    await ctx.watch()

    let { host, port } = await ctx.serve({
        servedir: paths.outDev,
    })

    let url = `http://localhost:${port}`;

    console.log('local server:', url);

    var start =
        process.platform == "darwin"
            ? "open"
            : process.platform == "win32"
                ? "start"
                : "xdg-open";
    require("child_process").exec(start + " " + url);

})();