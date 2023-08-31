const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverBaseNumfmtEngine',
    outfile: './lib/univer-base-numfmt-engine.js',
});
