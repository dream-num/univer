/* eslint-disable header/header */
import antfu from '@antfu/eslint-config';
import {
    baseRules,
    facadePreset,
    headerPreset,
    noBarrelImportPreset,
    penetratingPreset,
    specPreset,
    tailwindcssPreset,
    typescriptPreset,
    univerSourcePreset,
} from '@univerjs-infra/shared/eslint';

export default antfu(
    {
        ignores: [
            'mockdata/**/*.json',
            'pnpm-lock.yaml',
        ],
        stylistic: {
            indent: 4,
            semi: true,
        },
        regexp: false,
        react: true,
        yaml: {
            overrides: {
                'yaml/indent': ['error', 4, { indicatorValueIndent: 2 }],
            },
        },
        markdown: false,
        typescript: true,
        formatters: {
            css: true,
            html: true,
        },
        rules: baseRules,
    },
    headerPreset(),
    penetratingPreset(),
    typescriptPreset(),
    univerSourcePreset(),
    facadePreset(),
    noBarrelImportPreset(),
    tailwindcssPreset(),
    specPreset()
);
