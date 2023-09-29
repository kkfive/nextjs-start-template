module.exports = {
  // Configuration for JavaScript files
  extends: [
    'airbnb-base',
    'next/core-web-vitals', // Needed to avoid warning in next.js build: 'The Next.js plugin was not detected in your ESLint configuration'
    'plugin:prettier/recommended',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
    'no-console': 'error', // Allow console.log
  },
  overrides: [
    // Configuration for TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort'],
      extends: [
        'airbnb-typescript',
        'next/core-web-vitals',
        'plugin:prettier/recommended',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'prettier/prettier': [
          'error',
          {
            singleQuote: true,
            endOfLine: 'auto',
          },
        ],
        'react/destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
        'react/require-default-props': 'off', // Allow non-defined react props as undefined
        'react/jsx-props-no-spreading': 'off', // _app.tsx uses spread operator and also, react-hook-form
        'react-hooks/exhaustive-deps': 'off', // Incorrectly report needed dependency with Next.js router
        '@next/next/no-img-element': 'off', // We currently not using next/image because it isn't supported with SSG mode
        '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
        '@typescript-eslint/consistent-type-imports': 'error', // Ensure `import type` is used when it's necessary
        'no-restricted-syntax': [
          'error',
          'ForInStatement',
          'LabeledStatement',
          'WithStatement',
        ], // Overrides Airbnb configuration and enable no-restricted-syntax
        'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
        'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
        'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
          },
        ],
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
    },
  ],
}
