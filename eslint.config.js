import path from 'node:path'
import { fileURLToPath } from 'node:url'

import antfu from '@antfu/eslint-config'
import tailwind from 'eslint-plugin-tailwindcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default antfu(
  {
    // 项目类型：'lib' 用于库，默认为 'app'
    type: 'app',

    // 启用代码风格格式化规则
    stylistic: true,

    // 或自定义代码风格规则
    // stylistic: {
    //   indent: 2, // 4 或 'tab'
    //   quotes: 'single', // 或 'double'
    // },

    // TypeScript 和 Vue 会自动检测，也可以显式启用：
    nextjs: true,

    // 启用 jsonc 和 yaml 支持
    jsonc: true,
    yaml: true,

    // Flat config 不再支持 `.eslintignore`，使用 `ignores` 代替
    ignores: [
      '**/.next',
      '**/.claude',
      '**/components/ui',
      '**/node_modules',
      '**/.pnpm-store',
      '**/pnpm-lock.yaml',
      '**/docs',
      'CLAUDE.md',
    ],
    formatters: true,
  },
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        // Tailwind CSS v4 的配置路径应指向 CSS 文件
        config: path.join(__dirname, 'src/styles/tailwind.css'),
        // 可选，默认值：["class", "className", "ngClass", "@apply"]
        callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'tw', 'cn', 'className'],
      },
    },
  },
  // 层级依赖强制规则
  // 注意：domain/ 目前从 @/lib/request 导入是允许的
  // 此规则防止 domain 导入 React 组件
  {
    files: ['domain/**/*.ts', 'domain/**/*.tsx'],
    rules: {
      'no-restricted-imports': ['warn', {
        patterns: [{
          group: ['@/components/*', '@/app/*', '@/hooks/*', '@/store/*'],
          message: 'Domain layer should not import React components, hooks, or stores. Keep domain code framework-agnostic.',
        }],
      }],
    },
  },
)
