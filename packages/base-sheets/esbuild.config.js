const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverBaseSheets',
    outfile: './lib/univer-base-sheets.js',
});
