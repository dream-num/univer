const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverBaseFormulaEngine',
    outfile: './lib/univer-base-formula-engine.js',
});
