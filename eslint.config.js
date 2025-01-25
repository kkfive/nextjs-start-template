// import { fileURLToPath } from 'node:url'
import antfu from '@antfu/eslint-config'
// import tailwind from "eslint-plugin-tailwindcss";
// import { FlatCompat } from '@eslint/eslintrc'
// import js from '@eslint/js'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
//   allConfig: js.configs.all,
// })

// export default [
//   ...compat.extends('next')
// ]
//
export default antfu({
// Type of the project. 'lib' for libraries, the default is 'app'
  type: 'app',

  // Enable stylistic formatting rules
  // stylistic: true,

  // Or customize the stylistic rules
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
  },

  // TypeScript and Vue are autodetected, you can also explicitly enable them:
  typescript: true,
  react: true,
  vue: false,

  // Disable jsonc and yaml support
  jsonc: true,
  yaml: true,

  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  ignores: [
    '**/fixtures',
    '**/.next',
    // ...globs
  ],
  formatters: {
    /**
     * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
     * By default uses Prettier
     */
    css: true,
    /**
     * Format HTML files
     * By default uses Prettier
     */
    html: true,
    /**
     * Format Markdown files
     * Supports Prettier and dprint
     * By default uses Prettier
     */
    markdown: 'prettier',
  },
},
  // ...tailwind.configs["flat/recommended"]
)
