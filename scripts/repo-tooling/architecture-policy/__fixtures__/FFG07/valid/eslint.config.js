export default {
  files: ['apps/api/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: ['@/components/*', '@/service/*', '@kkfive/utils/dom', 'react', 'react-dom', 'next/*'],
    }],
  },
}
