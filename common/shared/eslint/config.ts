import type { Rules } from '@antfu/eslint-config';
import type { ESLint, Linter } from 'eslint';
import antfu from '@antfu/eslint-config';
import reactHooks from 'eslint-plugin-react-hooks';
import {
    facadePreset,
    headerPreset,
    indexEntryPreset,
    noBarrelImportPreset,
    penetratingPreset,
    specPreset,
    tailwindcssPreset,
    typescriptPreset,
    univerSourcePreset,
} from './presets';
import { baseRules } from './rules';

export interface IUniverEslintConfigOptions {
    ignores?: string[];
    header?: boolean;
    noFacadeImportsOutsideFacade?: {
        ignore?: string[];
    };
    rules?: Partial<Rules>;
}

export const createUniverEslintConfig = (options: IUniverEslintConfigOptions = {}) => {
    const configs: Linter.Config[] = [
        {
            plugins: {
                'react-hooks': reactHooks as unknown as ESLint.Plugin,
            },
            rules: {
                ...baseRules,
                ...options.rules,
            },
        },
        penetratingPreset(),
        typescriptPreset(),
        indexEntryPreset(),
        univerSourcePreset({
            noFacadeImportsOutsideFacade: options.noFacadeImportsOutsideFacade,
        }),
        facadePreset(),
        noBarrelImportPreset(),
        tailwindcssPreset(),
        specPreset(),
    ];

    if (options.header ?? true) {
        configs.push(headerPreset());
    }

    return antfu(
        {
            ignores: options.ignores,
            stylistic: {
                indent: 4,
                semi: true,
            },
            e18e: false,
            regexp: false,
            react: true,
            pnpm: false,
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
        },
        ...configs
    );
};
