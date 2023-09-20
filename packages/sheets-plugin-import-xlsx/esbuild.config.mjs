import esbuild from 'esbuild';

// eslint-disable-next-line import/no-relative-packages
import baseConfig from '../../esbuild.config.mjs';

esbuild.build({
    ...baseConfig,
    globalName: 'UniverSheetsPluginImportXlsx',
    outfile: './lib/univer-sheets-plugin-import-xlsx.js',
});
