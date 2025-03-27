import createConfig from '@univerjs-infra/shared/vitest';

export default createConfig({
    test: {
        alias: [
            {
                find: /^monaco-editor$/,
                // eslint-disable-next-line node/no-path-concat
                replacement: `${__dirname}/node_modules/monaco-editor/esm/vs/editor/editor.api`,
            },
        ],
    },
});
