const tsc = require('tsc-prog');

tsc.build({
    basePath: __dirname, // always required, used for relative paths
    configFilePath: 'tsconfig.json', // config to inherit from (optional)
    compilerOptions: {
        rootDir: 'src',
        outDir: 'dist',
        declaration: true,
        skipLibCheck: true,
    },
    bundleDeclaration: {
        entryPoint: './facade/index.d.ts', // relative to the OUTPUT directory ('dist' here)
        fallbackOnError: false, // default: true
        globals: false, // default: true
        augmentations: false, // default: true
    },
    include: ['src/**/*'],
    exclude: ['**/*.test.ts', '**/*.spec.ts'],
});
