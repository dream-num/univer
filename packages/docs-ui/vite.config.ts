import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/design',
                '@univerjs/docs',
                '@univerjs/engine-render',
                '@univerjs/ui',
                '@wendellhu/redi',
                'react',
                'rxjs',
            ],
            output: {
                assetFileNames: 'index.css',
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/design': 'UniverDesign',
                    '@univerjs/docs': 'UniverDocs',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@univerjs/ui': 'UniverUi',
                    '@wendellhu/redi': '@wendellhu/redi',
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
