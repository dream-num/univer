import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/design',
                '@univerjs/docs',
                '@univerjs/engine-formula',
                '@univerjs/engine-render',
                '@univerjs/sheets',
                '@univerjs/sheets-ui',
                '@univerjs/ui',
                '@wendellhu/redi',
                '@wendellhu/redi/react-bindings',
                'react',
                'rxjs',
            ],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/design': 'UniverDesign',
                    '@univerjs/docs': 'UniverDocs',
                    '@univerjs/engine-formula': 'UniverEngineFormula',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@univerjs/sheets': 'UniverSheets',
                    '@univerjs/sheets-ui': 'UniverSheetsUi',
                    '@univerjs/ui': 'UniverUi',
                    '@wendellhu/redi': '@wendellhu/redi',
                    '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
                    react: 'React',
                    rxjs: 'rxjs',
                },
            },
        },
    },
}, {
    mode,
    pkg,
    features: {
        react: true,
        css: true,
        dom: true,
    },
});
