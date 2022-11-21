/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageReporters: ['json', 'html'],
    // coveragePathIgnorePatterns: ['src/Render/'],
    testMatch: ['<rootDir>/test/**/*.test.ts'],
    // collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**', '!**/vendor/**'],
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
};
