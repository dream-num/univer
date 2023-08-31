const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverSheetsPluginImage',
    outfile: './lib/univer-sheets-plugin-image.js',
});
