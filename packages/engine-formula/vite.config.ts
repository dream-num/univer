import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@wendellhu/redi',
                'rxjs',
            ],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@wendellhu/redi': '@wendellhu/redi',
                    rxjs: 'rxjs',
                },
            },
        },
    },
}, {
    mode,
    pkg,
});
