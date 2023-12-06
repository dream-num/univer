import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig, { postBuild } from '../../esbuild.config.mjs';

for (const format of ['cjs', 'esm']) {
    await esbuild.build({
        ...baseConfig,
        globalName: 'UniverDocs',
        entryPoints: {
            index: './src/index.ts',
            'locale/en-US': './src/locale/en-US.ts',
            'locale/zh-CN': './src/locale/zh-CN.ts',
        },
        outdir: `./lib/${format}`,
        format,
    });

    await postBuild(format);
}
