import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/engine-formula',
                '@univerjs/network',
                '@univerjs/sheets',
                '@univerjs/sheets-formula',
                '@univerjs/sheets-numfmt',
                '@wendellhu/redi',
                'rxjs',
            ],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/engine-formula': 'UniverEngineFormula',
                    '@univerjs/network': 'UniverNetwork',
                    '@univerjs/sheets': 'UniverSheets',
                    '@univerjs/sheets-formula': 'UniverSheetsFormula',
                    '@univerjs/sheets-numfmt': 'UniverSheetsNumfmt',
                    '@wendellhu/redi': '@wendellhu/redi',
                    rxjs: 'rxjs',
                },
            },
        },
    },
}, {
    mode,
    pkg,
    features: {
        dom: true, // FIXME: should not use dom here
    },
});
