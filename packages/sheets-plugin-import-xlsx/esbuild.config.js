const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverSheetsPluginImportXlsx',
    outfile: './lib/univer-sheets-plugin-import-xlsx.js',
});
