// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  moduleNameMapper: {
    /* Handle libraries */
    '^lib/supabase$': '<rootDir>/__mocks__/supabase.ts',
    '^d3-force$': '<rootDir>/__mocks__/d3-force.ts',
    '^d3-drag$': '<rootDir>/__mocks__/d3-drag.ts',
    '^d3-zoom$': '<rootDir>/__mocks__/d3-zoom.ts',
    '^d3-selection$': '<rootDir>/__mocks__/d3-selection.ts',
    '^unified$': '<rootDir>/__mocks__/unified.ts',
    '^remark-parse$': '<rootDir>/__mocks__/remark-parse.ts',
    '^remark-gfm$': '<rootDir>/__mocks__/remark-gfm.ts',
    '^next/router$': '<rootDir>/__mocks__/next-router.ts',
  },
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/__tests__/.eslintrc.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
