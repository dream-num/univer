const { resolve } = require('node:path');
const tsConfig = require('./tsconfig.json');

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier',
        'import',
        'import-newlines',
        'unused-imports',
        'simple-import-sort',
        'react',
        'header',
    ],
    extends: [
        'airbnb-base', // https://www.npmjs.com/package/eslint-config-airbnb-base
        'airbnb-typescript/base', // https://www.npmjs.com/package/eslint-config-airbnb-typescript
        // "plugin:@typescript-eslint/recommended",// no need https://typescript-eslint.io/
        'plugin:prettier/recommended',
        'prettier',
    ],
    // parserOptions: {
    //     ecmaVersion: 12,
    //     sourceType: 'module',
    //     // https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
    //     project: [
    //         './tsconfig.eslint.json',
    //         './packages/*/tsconfig.json',
    //         './examples/*/tsconfig.json',
    //         './apps/*/tsconfig.json',
    //     ],
    // },
    rules: {
        'header/header': [
            2,
            'block',
            [
                '*',
                ' * Copyright 2023-present DreamNum Inc.',
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
        'no-cond-assign': 'off',
        'no-restricted-globals': 'off',
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
            },
        ],
        // turn on errors for missing imports
        'import/no-unresolved': [
            2,
            {
                ignore: ['\\.less$', '^@'],
            },
        ],
        'import/no-cycle': 'warn',
        'no-param-reassign': 'off',
        'no-bitwise': 'off',
        'default-case': 'off',
        'class-methods-use-this': 'off',
        'consistent-return': 'off',
        'no-underscore-dangle': 'off',
        'no-restricted-syntax': 'off',
        'max-classes-per-file': 'off',
        'prefer-destructuring': 'off',
        'no-plusplus': 'off',
        'no-return-assign': 'off',
        'no-continue': 'off',
        'no-loop-func': 'off',
        '@typescript-eslint/naming-convention': [
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
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-loop-func': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'guard-for-in': 'off',
        'no-prototype-builtins': 'off',
        'no-lonely-if': 'off',
        radix: 'off',
        'no-nested-ternary': 'off',
        'no-new': 'off',
        'no-unused-expressions': 'off',
        'no-console': 'off',
        'no-multi-assign': 'off',
        'no-restricted-properties': 'off',
        'no-control-regex': 'off',
        'no-await-in-loop': 'off',
        '@typescript-eslint/array-type': [
            'error',
            {
                default: 'array-simple',
            },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'no-public',
            },
        ],
        'spaced-comment': 'off',
        eqeqeq: [
            'error',
            'always',
            {
                null: 'ignore',
            },
        ],
        // eslint-plugin-unused-imports
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/default-param-last': 'off',
        '@typescript-eslint/lines-between-class-members': [
            'warn',
            { enforce: [{ blankLine: 'always', prev: '*', next: 'method' }] },
            { exceptAfterSingleLine: true },
        ],
        // '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-redeclare': 'off', // dependency interface and dependency token share the same name
        '@typescript-eslint/no-unused-vars': 'warn',
        'grouped-accessor-pairs': 'off',
        'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 2] }],
        'no-unsafe-optional-chaining': 'off',
        'prefer-regex-literals': 'off',
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': 'error',
        'unused-imports/no-unused-imports': 'error',
        '@typescript-eslint/consistent-type-definitions': ['warn'],
        '@typescript-eslint/consistent-type-imports': ['warn'],
        'react/self-closing-comp': [
            'error',
            {
                component: true,
            },
        ],
    },
    // https://www.npmjs.com/package/eslint-import-resolver-typescript
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: './tsconfig.json',
            },
            node: {
                extensions: ['.ts', '.tsx'],
            },
        },
    },

    overrides: [
        ...tsConfig.references.map(({ path }) => ({
            files: [`${path}/src/**/*.ts`, `${path}/src/**/*.tsx`],
            parserOptions: {
                project: resolve(__dirname, './tsconfig.eslint.json'),
            },
        })),
    ],
};

module.exports = config;
