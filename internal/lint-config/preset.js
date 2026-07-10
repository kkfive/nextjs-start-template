import path from 'node:path'
import { fileURLToPath } from 'node:url'

import antfu from '@antfu/eslint-config'

/**
 * 创建 ESLint 配置。
 *
 * @param {object} options
 * @param {boolean} [options.tailwind=true] - 是否加载 eslint-plugin-tailwindcss。
 *   非 Tailwind 应用（如 Hono 后端、尚未接入 tailwindcss 的 app）传 false 跳过，
 *   否则插件启动时会因找不到 tailwindcss 包而崩溃。
 * @param {string} [options.tailwindCssPath] - 该 app 的 tailwind.css 路径（用于 tailwind plugin 检测）
 * @param {string} [options.appDir] - 该 app 的根目录（用于解析 cssConfigPath 相对路径），默认为调用方目录
 * @param {Record<string, any>[]} [options.overrides] - 额外的 config 对象，追加在末尾
 * @returns {Promise<unknown[]>}
 */
export async function createConfig(options = {}) {
  const {
    tailwind = true,
    tailwindCssPath = 'src/styles/tailwind.css',
    appDir = process.cwd(),
    overrides = [],
  } = options
  const cssConfigPath = path.isAbsolute(tailwindCssPath)
    ? tailwindCssPath
    : path.join(appDir, tailwindCssPath)

  // 动态导入：非 tailwind 应用不加载该插件，避免 require('tailwindcss') 崩溃
  const tailwindConfigs = tailwind
    ? await import('eslint-plugin-tailwindcss').then(m => (m.default ?? m).configs.recommended)
    : []

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
    tailwindConfigs,
    tailwind
      ? {
          settings: {
            tailwindcss: {
              cssConfigPath,
              functions: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'tw', 'cn'],
            },
          },
        }
      : {},
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
