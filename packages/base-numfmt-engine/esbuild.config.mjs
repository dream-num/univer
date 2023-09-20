import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../esbuild.config.mjs';

esbuild.build({
    ...baseConfig,
    globalName: 'UniverBaseNumfmtEngine',
    outfile: './lib/univer-base-numfmt-engine.js',
});
