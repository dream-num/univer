/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'ts', 'tsx'],

    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.tsx?$': 'babel-jest', // https://github.com/kulshekhar/ts-jest/issues/937#issuecomment-455431207
    },
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    },
};
