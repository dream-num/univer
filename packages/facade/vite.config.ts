import { resolve } from 'node:path';
import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    test: {
        setupFiles: [
            resolve(__dirname, './jest.setup.ts'),
            resolve(__dirname, './vitest.setup.ts'),
        ],
        environment: 'jsdom',
    },
}, {
    mode,
    pkg,
});
