module.exports = {
    // env: {
    //     browser: true,
    //     es2021: true,
    //     node: true,
    //     jest: true,
    // },
    globals: {
        page: true,
        browser: true,
        context: true,
        jestPuppeteer: true,
    },
    // parser: '@typescript-eslint/parser',
    // extends: ['airbnb-typescript', 'prettier', 'eslint:recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
    extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
        ecmaVersion: 12,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./packages/*/tsconfig.json'],
    },
    plugins: ['@typescript-eslint', 'prettier', 'import', 'import-newlines', 'unused-imports'],
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
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        // turn on errors for missing imports
        'import/no-unresolved': [2, { ignore: ['\\.less$', '^@'] }],
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'import/no-cycle': 'off',
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
        '@typescript-eslint/no-loop-func': 'off',
        'guard-for-in': 'off',
        'no-prototype-builtins': 'off',
        'no-lonely-if': 'off',
        'prefer-const': 'off',
        radix: 'off',
        'no-nested-ternary': 'off',
        'no-new': 'off',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'no-console': 'off',
        'no-multi-assign': 'off',
        'no-restricted-properties': 'off',
        'no-control-regex': 'off',
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        'no-await-in-loop': 'off',
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
        eqeqeq: ['error', 'always', { null: 'ignore' }],

        // eslint-plugin-unused-imports
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',

        'prefer-regex-literals': 'off',
        '@typescript-eslint/default-param-last': 'off',
        'grouped-accessor-pairs': 'off',
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                // always try to resolve config under `<root>@config`
                // directory even it doesn't contain any source code,
                // like `@config/unist`
                alwaysTryTypes: true,
                // Choose from one of the "project" configs below or omit
                // to use <root>/tsconfig.json by default
                // use <root>/path/to/folder/tsconfig.json
                project: './tsconfig.json',
            },
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
};
