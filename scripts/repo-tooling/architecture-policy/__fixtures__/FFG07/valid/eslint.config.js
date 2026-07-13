export default {
  files: ['apps/api/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', { patterns: ['react'] }],
  },
}
