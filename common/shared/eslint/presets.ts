import type { ESLint, Linter } from 'eslint';
import os from 'node:os';
import path from 'node:path';
import { fixupPluginRules } from '@eslint/compat';
import typescriptParser from '@typescript-eslint/parser';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import header from 'eslint-plugin-header';
import barrel from 'eslint-plugin-no-barrel-import';
import penetrating from 'eslint-plugin-no-penetrating-import';
import noExternalImportsInFacade from './plugins/no-external-imports-in-facade';
import noFacadeImportsOutsideFacade from './plugins/no-facade-imports-outside-facade';
import noMixedTypeSpecifiersInIndex from './plugins/no-mixed-type-specifiers-in-index';
import noSelfPackageImports from './plugins/no-self-package-imports';

const univerPlugin = {
    rules: {
        'no-external-imports-in-facade': noExternalImportsInFacade,
        'no-self-package-imports': noSelfPackageImports,
        'no-facade-imports-outside-facade': noFacadeImportsOutsideFacade,
        'no-mixed-type-specifiers-in-index': noMixedTypeSpecifiersInIndex,
    },
} satisfies ESLint.Plugin;

/**
 * TypeScript preset configuration for ESLint.
 * Applies TypeScript-specific rules and custom Univer rules.
 *
 * @returns ESLint configuration object for TypeScript files
 */
export const typescriptPreset = (): Linter.Config => {
    return {
        files: ['**/*.{ts,tsx,mts,cts}'],
        rules: {
            'ts/naming-convention': [
                'warn',
                // Interfaces' names should start with a capital 'I'.
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^I[A-Z0-9]',
                        match: true,
                    },
                },
                // Private fields of a class should start with an underscore '_'.
                {
                    selector: ['classMethod', 'classProperty'],
                    modifiers: ['private'],
                    format: ['camelCase'],
                    leadingUnderscore: 'require',
                },
            ],
            // 'ts/consistent-type-exports': 'warn',
        },
        languageOptions: {
            parser: typescriptParser,
        },
    };
};

/**
 * Index entry preset configuration for ESLint.
 * Keeps type-only imports and exports separate from value imports and exports.
 *
 * @returns ESLint configuration object for package entry files
 */
export const indexEntryPreset = (): Linter.Config => {
    return {
        files: ['**/src/index.ts'],
        rules: {
            'univer/no-mixed-type-specifiers-in-index': 'error',
        },
        plugins: {
            univer: univerPlugin,
        },
        languageOptions: {
            parser: typescriptParser,
        },
    };
};

/**
 * Univer source code preset configuration.
 * Enforces package structure rules for source files.
 *
 * @returns ESLint configuration object for Univer source files
 */
export const univerSourcePreset = (options: {
    noFacadeImportsOutsideFacade?: {
        ignore?: string[];
    };
} = {}): Linter.Config => {
    return {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: [
            '**/__tests__/**/*',
            '**/*.spec.ts',
            '**/*.test.ts',
        ],
        rules: {
            'univer/no-self-package-imports': 'error',
            'univer/no-facade-imports-outside-facade': ['error', {
                ignore: options.noFacadeImportsOutsideFacade?.ignore ?? [],
            }],
        },
        plugins: {
            univer: univerPlugin,
        },
        languageOptions: {
            parser: typescriptParser,
        },
    };
};

/**
 * Facade preset configuration for ESLint.
 * Enforces strict typing and import rules for facade files.
 *
 * @returns ESLint configuration object for facade files
 */
export const facadePreset = (): Linter.Config => {
    return {
        files: ['**/src/facade/**/*.ts'],
        ignores: [
            '**/__tests__/**/*',
            '**/*.spec.ts',
            '**/*.test.ts',
        ],
        rules: {
            'ts/explicit-function-return-type': 'error',
            'univer/no-external-imports-in-facade': 'error',
        },
        plugins: {
            univer: univerPlugin,
        },
    };
};

/**
 * Tailwind CSS preset configuration for ESLint.
 * Enforces Tailwind CSS class usage and formatting rules.
 *
 * @returns ESLint configuration object for files using Tailwind CSS
 */
export const tailwindcssPreset = (): Linter.Config => {
    const isWindows = os.platform() === 'win32';
    const lineBreakStyle = isWindows ? 'windows' : 'unix';

    return {
        files: ['**/*.tsx'],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            'better-tailwindcss': eslintPluginBetterTailwindcss,
        },
        settings: {
            'better-tailwindcss': {
                tailwindConfig: path.resolve(__dirname, '../tailwind/tailwind.config.ts'),
            },
        },
        rules: {
            // enable all recommended rules to error
            ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
            'better-tailwindcss/enforce-consistent-line-wrapping': ['error', {
                printWidth: 120,
                group: 'newLine',
                lineBreakStyle,
            }],
            'better-tailwindcss/no-unknown-classes': 'off',
            'better-tailwindcss/no-conflicting-classes': 'off',
        },
    };
};

/**
 * Test/spec files preset configuration for ESLint.
 * Relaxed rules for test files to allow more flexible testing patterns.
 *
 * @returns ESLint configuration object for test files
 */
export const specPreset = (): Linter.Config => {
    return {
        files: [
            '**/*.spec.ts',
            '**/__tests__/**/*.ts',
        ],
        rules: {
            'ts/explicit-function-return-type': 'off',
        },
    };
};

/**
 * Penetrating import preset configuration for ESLint.
 * Prevents direct imports from internal package directories.
 *
 * @returns ESLint configuration object for preventing penetrating imports
 */
export const penetratingPreset = (): Linter.Config => {
    return {
        // Not penetrating for source files
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            penetrating: fixupPluginRules(penetrating),
        },
        ignores: [
            '**/__tests__/**/*',
            '**/__testing__/**/*',
            'examples/**/*',
        ],
        rules: {
            'penetrating/no-penetrating-import': 2,
        },
    };
};

/**
 * No barrel import preset configuration for ESLint.
 * Prevents barrel imports and enforces code complexity limits.
 *
 * @returns ESLint configuration object for preventing barrel imports
 */
export const noBarrelImportPreset = (): Linter.Config => {
    return {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: [
            'packages/engine-render/src/components/docs/**/*.ts',
            '**/*.tsx',
            '**/*.d.ts',
            '**/tsdown.config.ts',
            'playwright.config.ts',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/*.test.ts',
            '**/*.test.tsx',
        ], // do not check test files
        plugins: {
            barrel: fixupPluginRules(barrel),
        },
        rules: {
            'barrel/no-barrel-import': 2,
            complexity: ['warn', { max: 20 }],
            'max-lines-per-function': ['warn', 80],
        },
    };
};

/**
 * Header preset configuration for ESLint.
 * Enforces Apache License 2.0 header in package and preset source files.
 *
 * @returns ESLint configuration object for enforcing file headers
 */
export const headerPreset = (): Linter.Config => {
    header.rules.header.meta.schema = false;

    return {
        files: ['{packages,presets}/**/*.{ts,tsx}'],
        ignores: [
            '**/*.d.ts',
            '**/vitest.config.ts',
            '**/vitest.workspace.ts',
        ],
        plugins: {
            header: fixupPluginRules(header),
        },
        rules: {
            'header/header': [
                2,
                'block',
                [
                    '*',
                    ' * Copyright 2023-present DreamNum Co., Ltd.',
                    ' *',
                    ' * Licensed under the Apache License, Version 2.0 (the "License");',
                    ' * you may not use this file except in compliance with the License.',
                    ' * You may obtain a copy of the License at',
                    ' *',
                    ' *     http://www.apache.org/licenses/LICENSE-2.0',
                    ' *',
                    ' * Unless required by applicable law or agreed to in writing, software',
                    ' * distributed under the License is distributed on an "AS IS" BASIS,',
                    ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
                    ' * See the License for the specific language governing permissions and',
                    ' * limitations under the License.',
                    ' ',
                ],
                2,
            ],
        },
    };
};
