module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/simple.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};