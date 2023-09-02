const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverBaseRender',
    outfile: './lib/univer-base-render.js',
});
