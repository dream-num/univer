require('esbuild').build({
    bundle: true,
    color: true,
    loader: { '.svg': 'file' },
    sourcemap: false,
    alias: {
        'preact': 'react',
        'preact/hooks': 'react',
        'preact/compat': 'react'
    },
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
