import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    resolve: {
        alias: [
            {
                find: /^monaco-editor$/,
                // eslint-disable-next-line node/no-path-concat
                replacement: `${__dirname}/node_modules/monaco-editor/esm/vs/editor/editor.api`,
            },
        ],
    },
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/design',
                '@univerjs/facade',
                '@univerjs/sheets',
                '@univerjs/sheets-ui',
                '@univerjs/ui',
                '@wendellhu/redi',
                '@wendellhu/redi/react-bindings',
                'monaco-editor',
                'react',
                'rxjs',
            ],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/design': 'UniverDesign',
                    '@univerjs/facade': 'UniverFacade',
                    '@univerjs/sheets': 'UniverSheets',
                    '@univerjs/sheets-ui': 'UniverSheetsUi',
                    '@univerjs/ui': 'UniverUi',
                    '@wendellhu/redi': '@wendellhu/redi',
                    '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
                    'monaco-editor': 'monaco',
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
