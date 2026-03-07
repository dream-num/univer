import path from 'node:path';
import createConfig from '@univerjs-infra/shared/vitest';

export default createConfig({
    test: {
        setupFiles: [
            path.resolve(__dirname, './jest.setup.ts'),
            path.resolve(__dirname, './vitest.setup.ts'),
        ],
        environment: 'jsdom',
    },
});
