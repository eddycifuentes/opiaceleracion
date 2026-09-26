export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx', '**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};
