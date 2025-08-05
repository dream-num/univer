/* eslint-disable header/header */
import type { Rules } from '@antfu/eslint-config';
import type { Linter } from 'eslint';
import os from 'node:os';
import path from 'node:path';
import typescriptParser from '@typescript-eslint/parser';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import header from 'eslint-plugin-header';
import barrel from 'eslint-plugin-no-barrel-import';
import penetrating from 'eslint-plugin-no-penetrating-import';
import noExternalImportsInFacade from './plugins/no-external-imports-in-facade';
import noFacadeImportsOutsideFacade from './plugins/no-facade-imports-outside-facade';
import noSelfPackageImports from './plugins/no-self-package-imports';

/**
 * Base ESLint rules configuration for Univer project.
 * These rules apply to all TypeScript and JavaScript files.
 */

export const baseRules: Partial<Rules> = {
    // Code style and formatting rules
    curly: ['error', 'multi-line'],
    'antfu/if-newline': 'off',
    'no-param-reassign': ['warn'],
    'eol-last': ['error', 'always'],
    'no-empty-function': 'off',

    // TypeScript specific rules
    'ts/no-explicit-any': 'warn',
    'ts/no-redeclare': 'off',
    'ts/method-signature-style': 'off',

    // Style and formatting rules
    'style/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'style/jsx-first-prop-new-line': ['warn', 'multiline'],
    'style/arrow-parens': ['error', 'always'],
    'style/spaced-comment': 'off',
    'style/indent-binary-ops': 'off',
    'style/operator-linebreak': 'off',
    'style/indent': ['error', 4, {
        ObjectExpression: 'first',
        SwitchCase: 1,
        ignoreComments: true,
    }],
    'style/quotes': ['warn', 'single', { avoidEscape: true }],
    'style/jsx-closing-tag-location': 'warn',
    'style/jsx-curly-newline': ['warn', { multiline: 'forbid', singleline: 'forbid' }],
    'style/jsx-wrap-multilines': 'warn',
    'style/quote-props': ['warn', 'as-needed'],
    'style/jsx-curly-brace-presence': 'warn',
    'style/multiline-ternary': 'warn',

    // Comma and punctuation rules
    'style/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        enums: 'always-multiline',
        functions: 'never',
    }],

    // Filename conventions
    'unicorn/filename-case': [
        'error',
        {
            cases: {
                kebabCase: true,
                pascalCase: true,
            },
            ignore: [
                '^README-(\w+)?\\.md$',
                '^[a-z]{2}-[A-Z]{2}\.ts$',
                '^__tests__$',
                '^FUNDING.yml$',
                '^bug_report.yml$',
                '^bug_report.zh-CN.yml$',
                '^feature_request.yml$',
                '^feature_request.zh-CN.yml$',
            ],
        },
    ],

    // JSX and React rules
    'style/jsx-self-closing-comp': ['error', {
        component: true,
        html: true,
    }],
    'react-refresh/only-export-components': 'off',
    'react/no-unstable-context-value': 'warn',
    'react/no-unstable-default-props': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-create-ref': 'warn',

    // Import and export rules
    'sort-imports': [
        'error',
        {
            allowSeparatedGroups: false,
            ignoreCase: true,
            ignoreDeclarationSort: true,
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
    ],
    'perfectionist/sort-imports': 'warn',
    'perfectionist/sort-named-exports': 'warn',

    // Code quality rules
    'accessor-pairs': 'warn',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'jsdoc/tag-lines': 'off',

    // Restricted imports for consistency
    'no-restricted-imports': [
        'error',
        {
            paths: [
                {
                    name: 'clsx',
                    message: 'Please use `import { clsx } from \'@univerjs/design\'` instead.',
                },
            ],
        },
    ],

    // IMPORTANT: To ensure compatibility, some features of React 19 will be disabled.
    'react/no-forward-ref': 'off',
    'react/no-context-provider': 'off',
    'react-dom/no-render': 'off',
    'react/no-use-context': 'off',

    // Debatable rules - currently disabled
    'test/prefer-lowercase-title': 'off',
    'antfu/top-level-function': 'off',
    'unicorn/no-new-array': 'off',
    'unicorn/prefer-includes': 'off',
    'prefer-arrow-callback': 'off',
    'no-restricted-globals': 'off',
    'unicorn/prefer-string-starts-ends-with': 'warn',

    // Compatibility rules for legacy code - set to warn for gradual migration
    'unused-imports/no-unused-vars': 'warn',
    'ts/no-restricted-types': 'warn',
    'ts/no-wrapper-object-types': 'warn',
    'ts/no-empty-object-type': 'warn',
    'ts/no-unsafe-function-type': 'warn',
    'ts/no-unused-expressions': 'warn',
    'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'no-prototype-builtins': 'warn',
    'eslint-comments/no-unlimited-disable': 'off',
    'ts/prefer-ts-expect-error': 'off',
    'ts/ban-ts-comment': 'off',
    'ts/no-duplicate-enum-values': 'off',
    'no-cond-assign': 'warn',
    'ts/no-use-before-define': 'warn',
    'test/no-identical-title': 'warn',
    'ts/no-non-null-asserted-optional-chain': 'warn',
    'no-restricted-syntax': 'warn',
    'prefer-regex-literals': 'warn',
    'ts/no-this-alias': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'no-new': 'warn',
    'unicorn/error-message': 'warn',
    'ts/prefer-literal-enum-member': 'warn',
    'no-control-regex': 'warn',
    'ts/no-import-type-side-effects': 'warn',
    'unicorn/number-literal-case': 'warn',
    'unicorn/prefer-type-error': 'warn',
};

/**
 * TypeScript preset configuration for ESLint.
 * Applies TypeScript-specific rules and custom Univer rules.
 *
 * @returns ESLint configuration object for TypeScript files
 */
export const typescriptPreset = (): Linter.Config => {
    return {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            univer: {
                rules: {
                    // eslint-disable-next-line ts/no-explicit-any
                    'no-external-imports-in-facade': noExternalImportsInFacade as any,
                    // eslint-disable-next-line ts/no-explicit-any
                    'no-self-package-imports': noSelfPackageImports as any,
                    // eslint-disable-next-line ts/no-explicit-any
                    'no-facade-imports-outside-facade': noFacadeImportsOutsideFacade as any,
                },
            },
        },
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
 * Univer source code preset configuration.
 * Enforces package structure rules for source files.
 *
 * @returns ESLint configuration object for Univer source files
 */
export const univerSourcePreset = (): Linter.Config => {
    return {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: [
            '**/__tests__/**/*',
            '**/*.spec.ts',
            '**/*.test.ts',
        ],
        rules: {
            'univer/no-self-package-imports': 'error',
            'univer/no-facade-imports-outside-facade': 'error',
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
            // enable all recommended rules to warn
            ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
            // enable all recommended rules to error
            ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
            'better-tailwindcss/enforce-consistent-line-wrapping': ['error', {
                printWidth: 120,
                group: 'newLine',
                lineBreakStyle,
            }],
            'better-tailwindcss/no-unregistered-classes': 'off',
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
            penetrating,
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
            '**/vite.config.ts',
            'playwright.config.ts',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/*.test.ts',
            '**/*.test.tsx',
        ], // do not check test files
        plugins: {
            barrel,
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
 * Enforces Apache License 2.0 header in all source files.
 *
 * @returns ESLint configuration object for enforcing file headers
 */
export const headerPreset = (): Linter.Config => {
    header.rules.header.meta.schema = false;

    return {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: [
            '**/*.d.ts',
            '**/vite.config.ts',
            '**/vitest.config.ts',
            '**/vitest.workspace.ts',
            'playwright.config.ts',
        ],
        plugins: {
            header,
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
