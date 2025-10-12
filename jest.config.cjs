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
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
      },
    }],
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
    // Excluir componentes UI de shadcn/radix
    '!client/src/components/ui/**',
    // Excluir páginas simples
    '!client/src/pages/terms-page.tsx',
    '!client/src/pages/privacy-page.tsx',
    '!client/src/pages/about-page.tsx',
    '!client/src/pages/contact-page.tsx',
    '!client/src/pages/roadmap-page.tsx',
    '!client/src/pages/team-page.tsx',
    '!client/src/pages/success-page.tsx',
    '!client/src/pages/blog-page.tsx',
    '!client/src/pages/faq-page.tsx',
    // Excluir providers y configuración
    '!client/src/lib/theme-provider.tsx',
    '!client/src/AppProviders.tsx',
    '!client/src/i18n.ts',
    // Excluir archivos de configuración del servidor
    '!server/vite.ts',
    '!server/db.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    // Thresholds específicos para archivos críticos (sin global threshold)
    'shared/premium-utils.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'client/src/lib/utils.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@assets/(.*)$': '<rootDir>/client/src/assets/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    '^wouter$': '<rootDir>/__mocks__/wouter.js',
    '^framer-motion$': '<rootDir>/__mocks__/framer-motion.js',
    '^canvas-confetti$': '<rootDir>/__mocks__/canvas-confetti.js',
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.js',
    '^@tanstack/react-query$': '<rootDir>/__mocks__/@tanstack/react-query.js',
    '^@/hooks/use-toast$': '<rootDir>/__mocks__/@-hooks-use-toast.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(wouter|@tanstack/react-query|framer-motion|regexparam)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
};