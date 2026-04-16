import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'tsdown';

export default defineConfig({
    platform: 'browser',
    plugins: [
        nodePolyfills({
            include: ['fs'],
        }),
    ],
});
