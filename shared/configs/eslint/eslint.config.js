import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()
export default antfu(
  {
    vue: false,
    // unicorn: false,
    react: true,
    unocss: false,
    formatters: true,
  },
  {
    rules: {
      'import/order': 'error', // Import configuration for `eslint-plugin-import`
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'react-refresh/only-export-components': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // ...compat.config({ extends: ['next'] }),
  ...compat.config({
    extends: ['plugin:tailwindcss/recommended'],
    rules: {
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/migration-from-tailwind-2': 'off',
    },
  }),
)
