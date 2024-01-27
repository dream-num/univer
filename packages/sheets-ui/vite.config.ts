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
                '@univerjs/engine-numfmt',
                '@univerjs/engine-render',
                '@univerjs/sheets',
                '@univerjs/ui',
                '@wendellhu/redi',
                '@wendellhu/redi/react-bindings',
                'clsx',
                'react',
                'rxjs',
                'rxjs/operators',
            ],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/design': 'UniverDesign',
                    '@univerjs/docs': 'UniverDocs',
                    '@univerjs/engine-formula': 'UniverEngineFormula',
                    '@univerjs/engine-numfmt': 'UniverEngineNumfmt',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@univerjs/sheets': 'UniverSheets',
                    '@univerjs/ui': 'UniverUi',
                    '@wendellhu/redi': '@wendellhu/redi',
                    '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
                    clsx: 'clsx',
                    react: 'React',
                    rxjs: 'rxjs',
                    'rxjs/operators': 'rxjs.operators',
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
