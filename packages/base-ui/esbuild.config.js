const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverBaseUi',
    outfile: './lib/univer-base-ui.js',
});
