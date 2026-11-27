import { createUniverEslintConfig } from '@univerjs-infra/shared/eslint';

export default createUniverEslintConfig({
    ignores: [
        'pnpm-lock.yaml',
        'examples/public',
        'packages/sheets-conditional-formatting/src/assets/icon-map.ts',
    ],
    header: true,
    noFacadeImportsOutsideFacade: {
        ignore: [
            'presets/packages/preset-',
        ],
    },
});
