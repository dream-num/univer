import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../esbuild.config.mjs';

esbuild.build({
    ...baseConfig,
    globalName: 'UniverUiPluginSheets',
    outfile: './lib/univer-ui-plugin-sheets.js',
});
