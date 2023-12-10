import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: false,
    unicorn: false,
    react: true,
    unocss: true,
    formatters: true,
  },
  {
    rules: {
      'import/order': 'error', // Import configuration for `eslint-plugin-import`
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
  // ...compat.config({ extends: ['next'] }),
)
