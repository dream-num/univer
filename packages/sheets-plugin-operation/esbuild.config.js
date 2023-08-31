const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverSheetsPluginOperation',
    outfile: './lib/univer-sheets-plugin-operation.js',
});
