import path from 'node:path'
import { fileURLToPath } from 'node:url'

import antfu, { nextjs, react } from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-tailwindcss'

// 所有可执行源码的统一 glob，供框架规则和运行时例外复用。
const SOURCE_GLOB = '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'
const repositoryRoot = path.dirname(fileURLToPath(import.meta.url))

// Tailwind 规则必须按 app 读取各自的 CSS 入口，不能使用另一个 app 的 token。
function tailwindConfig(appName) {
  const recommended = tailwindcss.configs.recommended

  return {
    ...recommended,
    name: `kkfive/tailwind/${appName}`,
    files: [`apps/${appName}/${SOURCE_GLOB}`],
    settings: {
      ...recommended.settings,
      tailwindcss: {
        ...recommended.settings?.tailwindcss,
        cssConfigPath: path.join(repositoryRoot, `apps/${appName}/src/styles/tailwind.css`),
        functions: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'tw', 'cn'],
      },
    },
  }
}

function nextjsRootDirConfig(appName) {
  return {
    name: `kkfive/nextjs-root-dir/${appName}`,
    files: [`apps/${appName}/${SOURCE_GLOB}`],
    // Next 插件默认以 monorepo 根目录查找路由；每个应用需独立定位自己的 src/app。
    settings: {
      next: {
        rootDir: `apps/${appName}`,
      },
    },
  }
}

export default antfu(
  {
    // 使用 Prettier 规则提供统一、可保存时修复的格式化结果。
    formatters: true,
    ignores: [
      // 本地 agent 指令与工作流状态不属于产品源码。
      '**/.agents',
      '**/.claude',
      '**/.workflow',
      '**/AGENTS.md',
      // 构建、测试和包管理生成物不应被重复 lint。
      '**/.next',
      '**/.pnpm-store',
      '**/.turbo',
      '**/__fixtures__',
      '**/coverage',
      '**/dist',
      '**/node_modules',
      // 锁文件由包管理器维护，避免规则改写其生成格式。
      '**/package-lock.json',
      '**/pnpm-lock.yaml',
    ],
  },
  // React 规则只作用于真正渲染 React 的 app 与共享 UI package。
  await react({
    files: [
      `apps/admin/${SOURCE_GLOB}`,
      `apps/client/${SOURCE_GLOB}`,
      `packages/ui/${SOURCE_GLOB}`,
    ],
  }),
  // Next.js 规则只作用于两个 App Router 应用。
  await nextjs({
    files: [
      `apps/admin/${SOURCE_GLOB}`,
      `apps/client/${SOURCE_GLOB}`,
    ],
  }),
  nextjsRootDirConfig('admin'),
  nextjsRootDirConfig('client'),
  {
    name: 'kkfive/runtime/next-env',
    files: ['apps/*/src/config/env.ts'],
    rules: {
      // Next.js 会在浏览器构建中静态替换全局 process.env，禁止导入 Node process shim。
      'node/prefer-global/process': ['error', 'always'],
    },
  },
  {
    name: 'kkfive/runtime/react-fast-refresh-next-routes',
    files: [`apps/*/src/app/${SOURCE_GLOB}`],
    rules: {
      // 路由模块允许 Next.js 约定导出，其余混合导出仍会破坏 Fast Refresh。
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: false,
        allowExportNames: [
          'dynamic',
          'dynamicParams',
          'fetchCache',
          'generateMetadata',
          'generateStaticParams',
          'generateViewport',
          'maxDuration',
          'metadata',
          'preferredRegion',
          'revalidate',
          'runtime',
          'viewport',
        ],
      }],
    },
  },
  {
    name: 'kkfive/runtime/react-fast-refresh-tests',
    files: [
      '**/__tests__/**/*.{jsx,tsx}',
      '**/*.{test,spec}.{jsx,tsx}',
    ],
    rules: {
      // 测试模块不是 Fast Refresh 边界，可导出 render helper 与 fixture。
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    name: 'kkfive/runtime/markdown-formatting',
    files: ['**/*.md', '**/*.md/**'],
    rules: {
      // Markdown 的空行由 Prettier 控制，避免与 stylistic fixer 循环修复。
      'style/no-multiple-empty-lines': 'off',
    },
  },
  // 每个 app 使用自己的 Tailwind CSS 入口，保证 utility 校验基于正确 token。
  tailwindConfig('admin'),
  tailwindConfig('client'),
  {
    name: 'kkfive/runtime/hono',
    files: [`apps/api/${SOURCE_GLOB}`],
    rules: {
      // Hono 服务保持框架无关，禁止反向依赖 app UI、service 与 Next/React。
      'no-restricted-imports': ['error', {
        patterns: ['@/components/*', '@/service/*', '@kkfive/utils/dom', 'react', 'react-dom', 'next/*'],
      }],
    },
  },
  {
    name: 'kkfive/runtime/pure-typescript',
    files: [
      `packages/contracts/${SOURCE_GLOB}`,
      `packages/http-client/${SOURCE_GLOB}`,
      `packages/rpc/${SOURCE_GLOB}`,
      `packages/utils/${SOURCE_GLOB}`,
      `scripts/repo-tooling/${SOURCE_GLOB}`,
    ],
    rules: {
      // 正则中的字面空格可能是有意匹配，保留提示以便人工确认。
      'no-regex-spaces': 'warn',
      // Antfu 在编辑器中默认降为 warn；此范围仍以 error 阻止遗留 import。
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    name: 'kkfive/repository-types',
    rules: {
      // 项目统一使用 type，避免普通对象类型的 declaration merging；模块增强需单独缩小例外。
      'ts/consistent-type-definitions': ['error', 'type'],
    },
  },
)
