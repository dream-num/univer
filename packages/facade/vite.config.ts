import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    test: {
        setupFiles: [
            './jest.setup.ts',
            './vitest.setup.ts',
        ],
        environment: 'jsdom',
    },
}, {
    mode,
    pkg,
});
