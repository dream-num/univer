module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'import', 'import-newlines', 'unused-imports'],
    extends: [
        'airbnb-base', // https://www.npmjs.com/package/eslint-config-airbnb-base
        'airbnb-typescript/base', // https://www.npmjs.com/package/eslint-config-airbnb-typescript
        // "plugin:@typescript-eslint/recommended",// no need https://typescript-eslint.io/
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        // https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file
        project: './tsconfig.eslint.json',
    },
    rules: {
        'no-cond-assign': 'off',
        'no-restricted-globals': 'off',
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
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
        'import/no-cycle': 2,
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
        '@typescript-eslint/naming-convention': 'off',
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
        '@typescript-eslint/consistent-type-assertions': [
            'error',
            {
                assertionStyle: 'as',
                objectLiteralTypeAssertions: 'allow-as-parameter',
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
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'max-lines-per-function': ['error', 80],
        'prefer-regex-literals': 'off',
        '@typescript-eslint/default-param-last': 'off',
        'grouped-accessor-pairs': 'off',
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unsafe-return': 'error',
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
};
