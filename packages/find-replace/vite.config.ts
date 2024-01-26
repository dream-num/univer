import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/design',
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
