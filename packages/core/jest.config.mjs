/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageReporters: ['json', 'html'],
    globalSetup: '<rootDir>/test/globalSetup.js',
    // coveragePathIgnorePatterns: ['src/Render/'],
    testMatch: ['<rootDir>/**/test/**/*.test.ts'],
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
    coveragePathIgnorePatterns: [
        '<rootDir>/src/Server',
        '<rootDir>/src/Shared/RectTree',
        '<rootDir>/src/Controller/Group.ts',
        '<rootDir>/src/Module',
        '<rootDir>/src/Convertor',
        '<rootDir>/src/Shared/Generate.ts',
        '<rootDir>/src/Shared/IOHttp.ts',
        '<rootDir>/src/Shared/IOSocket.ts',
        '<rootDir>/src/Shared/TypeStoreBase.ts',
        '<rootDir>/src/Shared/TransformTool.ts',
    ],
};
