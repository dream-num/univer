import { createRequire } from 'node:module';
import createConfig from '@univerjs-infra/shared/vitest';

const require = createRequire(import.meta.url);
const reactRequire = createRequire(require.resolve('react'));

export default createConfig({
    resolve: {
        alias: [
            { find: /^react$/, replacement: require.resolve('react') },
            { find: /^react\/jsx-runtime$/, replacement: require.resolve('react/jsx-runtime') },
            { find: /^react\/jsx-dev-runtime$/, replacement: require.resolve('react/jsx-dev-runtime') },
            { find: /^react-dom$/, replacement: reactRequire.resolve('react-dom') },
            { find: /^react-dom\/client$/, replacement: reactRequire.resolve('react-dom/client') },
            { find: /^react-dom\/test-utils$/, replacement: reactRequire.resolve('react-dom/test-utils') },
        ],
    },
});
