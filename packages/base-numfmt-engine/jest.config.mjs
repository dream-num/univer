/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // coveragePathIgnorePatterns: ['src/Render/'],
    testMatch: ['<rootDir>/test/**/*.test.ts'],
    // collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**', '!**/vendor/**'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                babel: true,
                tsconfig: 'tsconfig.json',
            },
        ],
    },

    collectCoverage: true,
    coverageReporters: ['json', 'html'],
};
