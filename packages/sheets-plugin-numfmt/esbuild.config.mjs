import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../esbuild.config.mjs';

esbuild.build({
    ...baseConfig,
    globalName: 'UniverSheetsPluginNumfmt',
    entryPoints: {
        'univer-sheets-plugin-numfmt': './src/index.ts',
        'locale/en-US': './src/locale/en-US.ts',
        'locale/zh-CN': './src/locale/zh-CN.ts',
    },
    outdir: './lib',
});
