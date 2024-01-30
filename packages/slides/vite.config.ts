import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/engine-render',
                '@wendellhu/redi',
            ],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/engine-render': 'UniverEngineRender',
                    '@wendellhu/redi': '@wendellhu/redi',
                },
            },
        },
    },
}, {
    mode,
    pkg,
});
