module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // re-enable previously disabled rules; configure strict enforcement
    // baseline issues should now be addressed in source code instead of ignored
    'react-refresh/only-export-components': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-useless-escape': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // SECURITY: Prevent console statements in production
    // All console output must go through the centralized logger at src/lib/logger.ts
    'no-console': 'error',
  },
}
