/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/pacts'],
    testMatch: [
        '**/consumer-tests/**/*.contract.test.{ts,tsx}',
        '**/provider-tests/**/*.contract*.test.{ts,tsx}',
        '**/provider-tests/**/*.test.{ts,tsx}',
    ],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: {
                jsx: 'react-jsx',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                resolveJsonModule: true,
            },
            isolatedModules: true,
        }],
    },
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/pacts/setup-env.js'], // Load environment variables
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
    },
    testTimeout: 180000, // 3 minutes for provider verification (network calls to PactFlow)
    collectCoverage: false, // Don't collect coverage for contract tests
    maxWorkers: 1, // Run tests sequentially to avoid port conflicts
};

