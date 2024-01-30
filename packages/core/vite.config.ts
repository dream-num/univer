import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: ['@wendellhu/redi', 'rxjs', 'rxjs/operators'],
            output: {
                globals: {
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
