const args = require('minimist')(process.argv.slice(2));

(async () => {
    const ctx = await require('esbuild')[args.watch ? 'context' : 'build']({
        bundle: true,
        color: true,
        loader: { '.svg': 'file' },
        sourcemap: false,
        plugins: [
            require('esbuild-plugin-clean').clean({
                patterns: ['./local'],
            }),
            require('esbuild-plugin-copy').copy({
                assets: {
                    from: ['./public/*'],
                    to: ['./'],
                },
            }),
            require('esbuild-style-plugin')({
                cssModulesOptions: {
                    localsConvention: 'camelCaseOnly',
                    generateScopedName: 'univer-[local]',
                },
                renderOptions: {
                    lessOptions: { rewriteUrls: 'all' },
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
            port: 3002,
        });

        const url = `http://localhost:${port}`;
        console.log(`Local server: ${url}`);
    }
})();
