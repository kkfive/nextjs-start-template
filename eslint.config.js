import path from 'node:path'
import { fileURLToPath } from 'node:url'

import antfu from '@antfu/eslint-config'
import tailwind from 'eslint-plugin-tailwindcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default antfu(
  {
    // Type of the project. 'lib' for libraries, the default is 'app'
    type: 'app',

    // Enable stylistic formatting rules
    stylistic: true,

    // Or customize the stylistic rules
    // stylistic: {
    //   indent: 2, // 4, or 'tab'
    //   quotes: 'single', // or 'double'
    // },

    // TypeScript and Vue are autodetected, you can also explicitly enable them:
    nextjs: true,

    // Disable jsonc and yaml support
    jsonc: true,
    yaml: true,

    // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
    ignores: [
      '**/fixtures',
      '**/.next',
      '**/components/ui',
    // ...globs
    ],
    formatters: true,
  },
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        // For Tailwind CSS v4, the config path should point to the CSS file
        config: path.join(__dirname, 'src/styles/tailwind.css'),
        // Optional, default values: ["class", "className", "ngClass", "@apply"]
        callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'tw', 'cn', 'className'],
      },
    },
  },
)
