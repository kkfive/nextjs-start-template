import path from 'node:path'
import { fileURLToPath } from 'node:url'

import antfu from '@antfu/eslint-config'
import tailwind from 'eslint-plugin-tailwindcss'

/**
 * 创建 ESLint 配置。
 *
 * @param {object} options
 * @param {string} [options.tailwindCssPath] - 该 app 的 tailwind.css 路径（用于 tailwind plugin 检测）
 * @param {string} [options.appDir] - 该 app 的根目录（用于解析 cssConfigPath 相对路径），默认为调用方目录
 * @param {Record<string, any>[]} [options.overrides] - 额外的 config 对象，追加在末尾
 * @returns {Promise<unknown[]>}
 */
export async function createConfig(options = {}) {
  const { tailwindCssPath = 'src/styles/tailwind.css', appDir = process.cwd(), overrides = [] } = options
  const cssConfigPath = path.isAbsolute(tailwindCssPath)
    ? tailwindCssPath
    : path.join(appDir, tailwindCssPath)

  return antfu(
    {
      type: 'app',
      stylistic: true,
      nextjs: true,
      jsonc: true,
      yaml: true,
      ignores: [
        '**/.next',
        '**/.claude',
        '**/components/ui',
        '**/node_modules',
        '**/.pnpm-store',
        '**/pnpm-lock.yaml',
        '**/docs',
        '**/AGENTS.md',
        '**/eslint.config.*',
        '**/postcss.config.*',
        '**/next.config.*',
        '**/vitest.config.*',
        '**/vitest.setup.*',
        '**/commitlint.config.*',
        '**/lefthook.yml',
        '**/package.json',
        '**/package-lock.json',
        '**/tsconfig.json',
        '**/tsconfig.*.json',
        '**/.syncpackrc',
      ],
      formatters: true,
    },
    tailwind.configs.recommended,
    {
      settings: {
        tailwindcss: {
          cssConfigPath,
          functions: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'tw', 'cn'],
        },
      },
    },
    {
      rules: {
        'ts/consistent-type-definitions': ['error', 'type'],
        'pnpm/yaml-enforce-settings': 'off',
      },
    },
    ...overrides,
  )
}

// 保持兼容：直接默认导出一个调用，供 import { createConfig } 使用
export default createConfig

// 工具：返回调用方目录
export function callerDir(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl))
}
