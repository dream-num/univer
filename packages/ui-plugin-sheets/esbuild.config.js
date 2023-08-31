const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverUiPluginSheets',
    outfile: './lib/univer-ui-plugin-sheets.js',
});
