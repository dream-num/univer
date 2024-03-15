import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    test: {
        setupFiles: ['./vitest.setup.ts'],
        environment: 'jsdom',
        deps: {
            inline: ['vitest-canvas-mock'],
        },
        // For this config, check https://github.com/vitest-dev/vitest/issues/740
        threads: false,
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
