import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../esbuild.config.mjs';

esbuild.build({
    ...baseConfig,
    globalName: 'UniverCore',
    entryPoints: {
        index: './src/index.ts',
    },
    outdir: './lib',
});
