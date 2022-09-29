module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    extends: ['airbnb-typescript', 'prettier', 'eslint:recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        // project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'prettier', 'import'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        // turn on errors for missing imports
        'import/no-unresolved': 'error',
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true, // always try to resolve config under `<root>@config` directory even it doesn't contain any source code, like `@config/unist`

                // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json by default

                // use <root>/path/to/folder/tsconfig.json
                project: './tsconfig.json',
            },
        },
    },
};
