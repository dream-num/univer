import createConfig from '@univerjs-infra/shared/vitest';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig(
    createConfig({
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    })
);
