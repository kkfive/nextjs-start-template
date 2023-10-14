import antfu from '@antfu/eslint-config'
import unocss from '@unocss/eslint-config/flat'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu(
  {
    vue: false,
    unicorn: false,
  },
  unocss,
  {
    rules: {
      // 'unocss/order': 'off',
    },
  },
  // ...compat.config({ extends: ['next'] }),
  ...compat.config({
    // extends: ['plugin:tailwindcss/recommended'],
    rules: {
      // 'tailwindcss/classnames-order': 'error',
      // 'tailwindcss/no-custom-classname': [
      //   'error',
      //   {
      //     cssFiles: [
      //       '**/*.scss',
      //       '**/components/*.scss',
      //       '**/*.css',
      //       '!**/node_modules',
      //       '!**/.*',
      //       '!**/dist',
      //       '!**/build',
      //     ],
      //   },
      // ],
    },
  }),

)
