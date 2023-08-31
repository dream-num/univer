const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    alias: { react: 'preact/compat' },
    globalName: 'UniverBaseUi',
    outfile: './lib/univer-base-ui.js',
});
