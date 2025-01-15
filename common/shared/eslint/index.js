const jsdoc = require('eslint-plugin-jsdoc');
const eslintPluginReadableTailwind = require('eslint-plugin-readable-tailwind');
const noExternalImportsInFacade = require('./plugins/no-external-imports-in-facade');
const noSelfPackageImports = require('./plugins/no-self-package-imports');

exports.baseRules = {
    curly: ['error', 'multi-line'],
    'no-param-reassign': ['warn'],
    'eol-last': ['error', 'always'],
    'import/no-self-import': 'error',
    'ts/no-explicit-any': 'warn',
    'style/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'style/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        enums: 'always-multiline',
        functions: 'never',
    }],
    'no-empty-function': 'off',
    'style/arrow-parens': ['error', 'always'],
    'ts/no-redeclare': 'off',
    'antfu/if-newline': 'off',
    'style/spaced-comment': 'off',
    'tunicorn/number-literal-case': 'off',
    'style/indent-binary-ops': 'off',
    'ts/method-signature-style': 'off',
    'style/indent': ['error', 4, {
        ObjectExpression: 'first',
        SwitchCase: 1,
        ignoreComments: true,
    }],
    'perfectionist/sort-imports': 'warn',
    'perfectionist/sort-named-exports': 'warn',
    'antfu/consistent-chaining': 'warn',
    'sort-imports': [
        'error',
        {
            allowSeparatedGroups: false,
            //   ignoreCase: false,
            ignoreCase: true,
            ignoreDeclarationSort: true,
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
    ],
    'react/no-unstable-context-value': 'warn',
    'react/no-unstable-default-props': 'warn',
    'command/command': 'off',
    'jsdoc/tag-lines': 'off',

    // TODO: debatable rules
    'react/no-duplicate-key': 'warn',
    'test/prefer-lowercase-title': 'off',
    'antfu/top-level-function': 'off',
    'style/operator-linebreak': 'off',
    'unicorn/no-new-array': 'off',
    'unicorn/prefer-includes': 'off',
    'prefer-arrow-callback': 'off',
    'no-restricted-globals': 'off',
    'unicorn/prefer-string-starts-ends-with': 'warn',

    // TODO: just for compatibility with old code
    'unused-imports/no-unused-vars': 'warn',
    'style/jsx-closing-tag-location': 'warn',
    // 'ts/ban-types': 'warn',
    'ts/no-restricted-types': 'warn',
    'ts/no-wrapper-object-types': 'warn',
    'ts/no-empty-object-type': 'warn',
    'ts/no-unsafe-function-type': 'warn',
    'ts/no-unused-expressions': 'warn',
    'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'no-prototype-builtins': 'warn',
    'style/no-tabs': 'warn',
    'style/quotes': ['warn', 'single', { avoidEscape: true }],

    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'ts/prefer-ts-expect-error': 'off',
    'ts/ban-ts-comment': 'off',
    'ts/no-duplicate-enum-values': 'off',
    'no-cond-assign': 'warn',
    'antfu/consistent-list-newline': 'off',
    'ts/no-use-before-define': 'warn',
    'intunicorn/number-literal-case': 'off',
    'test/no-identical-title': 'warn',
    'ts/no-non-null-asserted-optional-chain': 'warn',
    'no-restricted-syntax': 'warn',
    'prefer-regex-literals': 'warn',
    'ts/no-this-alias': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'no-new': 'warn',
    'unicorn/error-message': 'warn',
    'ts/prefer-literal-enum-member': 'warn',
    'style/jsx-curly-newline': ['warn', { multiline: 'forbid', singleline: 'forbid' }],
    'no-control-regex': 'warn',
    'style/jsx-wrap-multilines': 'warn',
    'ts/no-import-type-side-effects': 'warn',
    'style/quote-props': ['warn', 'as-needed'],
    'unicorn/number-literal-case': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'style/jsx-curly-brace-presence': 'warn',
    'style/multiline-ternary': 'warn',
    'unicorn/prefer-type-error': 'warn',
    'accessor-pairs': 'warn',
    'react/no-create-ref': 'warn',
};

exports.typescriptPreset = () => {
    return {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            univer: {
                rules: {
                    'no-external-imports-in-facade': noExternalImportsInFacade,
                    'no-self-package-imports': noSelfPackageImports,
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
        },
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
        },
    };
};

exports.univerSourcePreset = () => {
    return {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: [
            '**/__tests__/**/*',
            '**/*.spec.ts',
            '**/*.test.ts',
        ],
        rules: {
            'univer/no-self-package-imports': 'error',
        },
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
        },
    };
};

exports.facadePreset = () => {
    return {
        files: ['**/src/facade/**/*.ts'],
        ignores: [
            '**/core/src/**/*.ts',
            '**/__tests__/**/*',
            '**/*.spec.ts',
            '**/*.test.ts',
        ],
        rules: {
            'ts/explicit-function-return-type': 'error',
            'univer/no-external-imports-in-facade': 'error',
            ...jsdoc.configs.recommended.rules,
            'jsdoc/tag-lines': 'off',
        },
    };
};

exports.tailwindcssPreset = () => {
    return {
        files: ['**/*.{jsx,tsx}'],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            'readable-tailwind': eslintPluginReadableTailwind,
        },
        rules: {
            ...eslintPluginReadableTailwind.configs.warning.rules,
            ...eslintPluginReadableTailwind.configs.error.rules,
            'jsonc/sort-keys': ['warn'],
            'readable-tailwind/multiline': ['warn', { printWidth: 120, group: 'newLine' }],
            'react-hooks/rules-of-hooks': 'off',
        },
    };
};

exports.specPreset = () => {
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
