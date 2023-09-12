/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'ts', 'tsx'],

    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                babel: true,
                tsconfig: 'tsconfig.json',
            },
        ],
        '.+\\.(css|less)$': 'jest-css-modules-transform',
    },

    collectCoverage: true,
    coverageReporters: ['json', 'html'],
};
