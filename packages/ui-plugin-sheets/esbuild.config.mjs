import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig, { postBuild } from '../../esbuild.config.mjs';

['cjs', 'esm'].forEach(async (format) => {
    await esbuild.build({
        ...baseConfig,
        globalName: 'UniverUiPluginSheets',
        entryPoints: {
            index: './src/index.ts',
            'locale/en-US': './src/locale/en-US.ts',
            'locale/zh-CN': './src/locale/zh-CN.ts',
        },
        outdir: `./lib/${format}`,
        format,
    });

    await postBuild(format);
});
