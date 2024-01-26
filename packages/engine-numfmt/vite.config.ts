import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: ['@univerjs/core'],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                },
            },
        },
    },
}, {
    mode,
    pkg,
});
