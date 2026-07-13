import path from 'node:path'
import { fileURLToPath } from 'node:url'

import antfu, { nextjs, react } from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-tailwindcss'

const SOURCE_GLOB = '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'
const ROOT_SOURCE_GLOB = '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'
const repositoryRoot = path.dirname(fileURLToPath(import.meta.url))

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

export default antfu(
  {
    type: 'app',
    stylistic: false,
    perfectionist: false,
    regexp: false,
    react: false,
    nextjs: false,
    jsonc: true,
    yaml: true,
    markdown: false,
    pnpm: true,
    formatters: true,
    ignores: [
      '**/.agents',
      '**/.claude',
      '**/.next',
      '**/.pnpm-store',
      '**/.turbo',
      '**/.workflow',
      '**/AGENTS.md',
      '**/__fixtures__',
      '**/coverage',
      '**/dist',
      '**/*.md',
      '**/node_modules',
      '**/package-lock.json',
      '**/pnpm-lock.yaml',
    ],
  },
  await react({
    files: [
      `apps/admin/${SOURCE_GLOB}`,
      `apps/client/${SOURCE_GLOB}`,
      `packages/ui/${SOURCE_GLOB}`,
    ],
    overrides: {
      'react-refresh/only-export-components': 'off',
      'react/jsx-no-comment-textnodes': 'warn',
      'react/no-array-index-key': 'warn',
    },
  }),
  await nextjs({
    files: [
      `apps/admin/${SOURCE_GLOB}`,
      `apps/client/${SOURCE_GLOB}`,
    ],
    overrides: {
      'next/no-html-link-for-pages': 'off',
    },
  }),
  {
    name: 'kkfive/runtime/next-env',
    files: ['apps/*/src/config/env.ts'],
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
  tailwindConfig('admin'),
  tailwindConfig('client'),
  {
    name: 'kkfive/runtime/hono',
    files: [`apps/api/${SOURCE_GLOB}`],
    rules: {
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
      'no-regex-spaces': 'warn',
      'test/prefer-lowercase-title': 'warn',
      'ts/consistent-type-definitions': ['warn', 'type'],
      'unused-imports/no-unused-imports': 'warn',
    },
  },
  {
    name: 'kkfive/runtime/tooling',
    files: [
      `internal/nextjs-config/${SOURCE_GLOB}`,
      `internal/tailwind-config/${SOURCE_GLOB}`,
      ROOT_SOURCE_GLOB,
      `scripts/${SOURCE_GLOB}`,
    ],
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
    },
  },
  {
    name: 'kkfive/runtime/api-server',
    files: ['apps/api/src/server.ts'],
    rules: {
      'node/prefer-global/process': 'off',
      'no-console': 'off',
    },
  },
  {
    name: 'kkfive/repository-overrides',
    rules: {
      'jsonc/sort-array-values': 'off',
      'jsonc/sort-keys': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'pnpm/yaml-enforce-settings': 'off',
      'pnpm/yaml-no-duplicate-catalog-item': 'off',
      'pnpm/yaml-no-unused-catalog-item': 'off',
      'ts/consistent-type-definitions': ['warn', 'type'],
      'yaml/sort-keys': 'off',
    },
  },
)
