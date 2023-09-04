const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverSheetsPluginFind',
    outfile: './lib/univer-sheets-plugin-find.js',
});
