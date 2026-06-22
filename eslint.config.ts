import { createUniverEslintConfig } from '@univerjs-infra/shared/eslint';

export default createUniverEslintConfig({
    ignores: [
        'mockdata/**/*.json',
        'pnpm-lock.yaml',
        'examples/src/demos.ts',
        'examples/public',
    ],
    header: true,
    noFacadeImportsOutsideFacade: {
        ignore: [
            'presets/packages/preset-',
        ],
    },
});
