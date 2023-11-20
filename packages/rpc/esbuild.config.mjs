import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../esbuild.config.mjs';

['cjs', 'esm'].forEach((format) => {
    esbuild.build({
        ...baseConfig,
        globalName: 'UniverRpc',
        entryPoints: {
            index: './src/index.ts',
        },
        outdir: `./lib/${format}`,
        format,
    });
});
