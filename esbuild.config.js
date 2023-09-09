/** @type {import('esbuild').BuildOptions} */
module.exports = {
    bundle: true,
    color: true,
    loader: { '.svg': 'file' },
    sourcemap: false,
    plugins: [
        require('esbuild-plugin-clean').clean({
            patterns: ['./lib'],
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
    entryPoints: ['./src/index.ts'],
    define: { 'process.env.NODE_ENV': '"production"' },
    format: 'esm',
    packages: 'external',
};
