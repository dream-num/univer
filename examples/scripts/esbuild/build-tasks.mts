import esbuild from 'esbuild';

export function nodeBuildTask() {
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
