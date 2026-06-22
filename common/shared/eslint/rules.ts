import type { Rules } from '@antfu/eslint-config';

/**
 * Base ESLint rules configuration for Univer project.
 * These rules apply to all TypeScript and JavaScript files.
 */
const qualityRules: Partial<Rules> = {
    // Code style and formatting rules
    curly: ['error', 'multi-line'],
    'antfu/if-newline': 'off',
    'no-param-reassign': ['warn'],
    'eol-last': ['error', 'always'],
    'no-empty-function': 'off',
};

const typescriptRules: Partial<Rules> = {
    // TypeScript specific rules
    'ts/no-explicit-any': 'warn',
    'ts/no-redeclare': 'off',
    'ts/method-signature-style': 'off',
};

const styleRules: Partial<Rules> = {
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
};

const filenameRules: Partial<Rules> = {
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
};

const reactRules: Partial<Rules> = {
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
    'react/rules-of-hooks': 'off',
    'react/static-components': 'off',
    'react/dom-no-render': 'off',
    'react/unsupported-syntax': 'off',
    'react/jsx-no-key-after-spread': 'off',
    'react/use-memo': 'warn',
    'react-hooks/static-components': 'off',
    'react-hooks/preserve-manual-memoization': 'off',
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/immutability': 'warn',
    'react-hooks/use-memo': 'warn',
    'react-hooks/purity': 'warn',
    'react-hooks/globals': 'warn',
};

const importRules: Partial<Rules> = {
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
    'perfectionist/sort-named-imports': 'off',
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
};

const disabledDebatableRules: Partial<Rules> = {
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
};

const migrationWarningRules: Partial<Rules> = {
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

export const baseRules: Partial<Rules> = {
    ...qualityRules,
    ...typescriptRules,
    ...styleRules,
    ...filenameRules,
    ...reactRules,
    ...importRules,
    ...disabledDebatableRules,
    ...migrationWarningRules,
};
