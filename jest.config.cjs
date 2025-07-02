/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/shared', '<rootDir>/server', '<rootDir>/client/src'],
  testMatch: [
    '**/__tests__/**/*.{ts,tsx,js}',
    '**/*.{test,spec}.{ts,tsx,js}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!client/src/**/*.d.ts',
    '!client/src/main.tsx',
    '!client/src/vite-env.d.ts',
    '!server/index.ts',
    '!**/*.config.{ts,js}',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@assets/(.*)$': '<rootDir>/client/src/assets/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(wouter|@tanstack/react-query|framer-motion)/)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
};