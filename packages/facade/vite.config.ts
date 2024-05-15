import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    test: {
        setupFiles: ['./vitest.setup.ts'],
        environment: 'jsdom',
        deps: {
            optimizer: {
                web: {
                    include: ['vitest-canvas-mock'],
                },
            },
        },
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        environmentOptions: {
            jsdom: {
                resources: 'usable',
            },
        },
    },
}, {
    mode,
    pkg,
});
