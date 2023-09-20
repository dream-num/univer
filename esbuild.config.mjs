import cleanPlugin from 'esbuild-plugin-clean';
import stylePlugin from 'esbuild-style-plugin';

/** @type {import('esbuild').BuildOptions} */
export default {
    bundle: true,
    color: true,
    loader: { '.svg': 'file' },
    sourcemap: false,
    plugins: [
        cleanPlugin({
            patterns: ['./lib'],
        }),
        stylePlugin({
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
