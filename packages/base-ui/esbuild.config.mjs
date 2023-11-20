import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../esbuild.config.mjs';

['cjs', 'esm'].forEach((format) => {
    esbuild.build({
        ...baseConfig,
        globalName: 'UniverBaseUi',
        entryPoints: {
            index: './src/index.ts',
            'locale/en-US': './src/locale/en-US.ts',
            'locale/zh-CN': './src/locale/zh-CN.ts',
        },
        outdir: `./lib/${format}`,
        format,
    });
});
