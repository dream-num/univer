import { createUniverEslintConfig } from '@univerjs-infra/shared/eslint';

export default createUniverEslintConfig({
    ignores: [
        'pnpm-lock.yaml',
        'examples/public',
    ],
    header: true,
    noFacadeImportsOutsideFacade: {
        ignore: [
            'presets/packages/preset-',
        ],
    },
});
