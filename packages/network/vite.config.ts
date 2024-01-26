import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: ['@univerjs/core', '@wendellhu/redi', 'rxjs', 'rxjs/operators'],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@wendellhu/redi': '@wendellhu/redi',
                    rxjs: 'rxjs',
                    'rxjs/operators': 'rxjs.operators',
                },
            },
        },
    },
}, {
    mode,
    pkg,
});
