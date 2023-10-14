import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu(
  {},
  // ...compat.config({ extends: ['next'] }),
  ...compat.config({
    extends: ['plugin:tailwindcss/recommended'],
    rules: {
      'tailwindcss/classnames-order': 'error',
      'tailwindcss/no-custom-classname': [
        'error',
        {
          cssFiles: [
            '**/*.scss',
            '**/components/*.scss',
            '**/*.css',
            '!**/node_modules',
            '!**/.*',
            '!**/dist',
            '!**/build',
          ],
        },
      ],
    },
  }),

)
