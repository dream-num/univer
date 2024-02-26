import createViteConfig from '@univerjs/shared/vite';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    test: {
        alias: [
            {
                find: /^monaco-editor$/,
                // eslint-disable-next-line node/no-path-concat
                replacement: `${__dirname}/node_modules/monaco-editor/esm/vs/editor/editor.api`,
            },
        ],
    },
}, {
    mode,
    pkg,
    features: {
        react: true,
        css: true,
        dom: true,
    },
});
