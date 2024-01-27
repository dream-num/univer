import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    build: {
        rollupOptions: {
            external: [
                '@univerjs/core',
                '@univerjs/engine-formula',
                '@univerjs/engine-render',
                '@wendellhu/redi',
                'rxjs',
                'rxjs/operators',
            ],
            output: {
                globals: {
                    '@univerjs/core': 'UniverCore',
                    '@univerjs/engine-formula': 'UniverEngineFormula',
                    '@univerjs/engine-render': 'UniverEngineRender',
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
