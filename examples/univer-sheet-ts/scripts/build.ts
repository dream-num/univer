// scripts/build.ts
import { build } from "esbuild";
import { promises } from "fs";
import { commonBuildOptions, hasFolder, paths } from "./common";

if (hasFolder(paths.outDev)) {
    promises.rm(paths.out, { recursive: true });
}

build({
    ...commonBuildOptions,
    outdir: paths.out,
    define: { ["process.env.NODE_ENV"]: '"production"' },
    format: 'iife',
    globalName: 'UniverCore',
    //   minify: true,
    // outExtension:{'.js':'.cjs'}, // esm => .js, cjs => .cjs, iife => .iife.js
    packages: 'external',
    sourcemap: true,
}).then(() => {
    promises.copyFile(paths.index, `${paths.out}/index.html`);
});