import { defineWorkspace } from 'vitest/config'

/**
 * vitest workspace —— 聚合各 app/package 的测试配置。
 * 各 workspace 项目可有自己的 vitest.config.ts（如 apps/client），
 * 此文件让 `vitest` 在根目录运行时发现所有项目。
 */
export default defineWorkspace([
  'apps/client',
  'packages/domain-core',
])
