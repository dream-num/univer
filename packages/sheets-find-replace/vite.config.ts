import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/design',
                '@univerjs/engine-render',
                '@univerjs/find-replace',
                '@univerjs/sheets',
                '@univerjs/sheets-ui',
                '@univerjs/ui',
                '@wendellhu/redi',
                'react',
            ],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/design': 'UniverDesign',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@univerjs/find-replace': 'UniverFindReplace',
                    '@univerjs/sheets': 'UniverSheets',
                    '@univerjs/sheets-ui': 'UniverSheetsUi',
                    '@univerjs/ui': 'UniverUi',
                    '@wendellhu/redi': '@wendellhu/redi',
                    react: 'React',
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
