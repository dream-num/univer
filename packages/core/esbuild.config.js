const baseconfig = require('../../esbuild.config');

require('esbuild').build({
    ...baseconfig,
    globalName: 'UniverCore',
    outfile: './lib/univer-core.js',
});
