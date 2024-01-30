import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/design',
                '@univerjs/engine-render',
                '@wendellhu/redi',
                '@wendellhu/redi/react-bindings',
                'clsx',
                'react',
                'react-dom',
                'rxjs',
                'rxjs/operators',
            ],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/design': 'UniverDesign',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@wendellhu/redi': '@wendellhu/redi',
                    '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
                    clsx: 'clsx',
                    react: 'React',
                    'react-dom': 'ReactDOM',
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
