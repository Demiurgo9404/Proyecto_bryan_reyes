import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/presentation/components/$1',
    '^@/pages/(.*)$': '<rootDir>/src/presentation/pages/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/presentation/hooks/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/presentation/contexts/$1',
    '^@/services/(.*)$': '<rootDir>/src/infrastructure/services/$1',
    '^@/repositories/(.*)$': '<rootDir>/src/infrastructure/repositories/$1',
    '^@/utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@mui|@babel|@testing-library|@emotion|@babel|@jest|@types|@testing-library/jest-dom|@testing-library/user-event|@testing-library/dom|@testing-library/react|@testing-library/react-hooks|@testing-library/jest-dom|@testing-library/user-event|@testing-library/dom|@testing-library/react|@testing-library/react-hooks)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/index.tsx',
    '!src/**/vite-env.d.ts',
    '!src/main.tsx',
    '!src/App.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
