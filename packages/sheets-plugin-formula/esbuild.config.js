const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverSheetsPluginFormula',
    outfile: './lib/univer-sheets-plugin-formula.js',
});
