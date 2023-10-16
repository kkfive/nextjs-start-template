import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import unocss from '@unocss/eslint-config/flat'

const compat = new FlatCompat()

export default antfu(
  {
    vue: false,
    unicorn: false,
  },
  unocss,
  {
    rules: {
      'import/order': 'off', // Import configuration for `eslint-plugin-import`
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
  ...compat.config({
    plugins: ['simple-import-sort'],
    rules: {
      'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
      'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
    },
  }),
  // ...compat.config({ extends: ['next'] }),
)
