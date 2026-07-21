export type GovernanceGate
  = | { command: string, kind: 'command' }
    | { assertion: string, kind: 'static' }

export type GovernanceProfile = {
  allowedPaths: readonly string[]
  budgetTokens: number
  expectedRules: readonly string[]
  expectedSkills: readonly string[]
  forbiddenCategories: readonly string[]
  gates: readonly GovernanceGate[]
  id: string
  maxForbiddenCategoryHits: number
  prompt: string
  requiredHitRate: number
}

export const profiles = [
  {
    id: 'next-page',
    prompt: '在 apps/client 新增账户设置页面：路由只组合 feature 公开入口，Server Component 获取首屏数据，Client Component 使用现有表单与共享基础控件完成保存交互；补齐必要测试。',
    allowedPaths: ['apps/client/**'],
    expectedRules: ['feature.rule.md', 'next-app.rule.md', 'testing.rule.md'],
    expectedSkills: ['nextjs-app-router', 'coding-standards'],
    forbiddenCategories: ['project-architecture', 'styling-system', 'monorepo-engineering'],
    budgetTokens: 6400,
    requiredHitRate: 1,
    maxForbiddenCategoryHits: 0,
    gates: [
      { kind: 'command', command: 'pnpm verify' },
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm --filter client build' },
    ],
  },
  {
    id: 'package-test',
    prompt: '为 packages/http-client 的 BusinessError、createErrorResponse 和 HttpService 增加错误路径、边界与网络隔离测试；在该 package 内补齐 test:run，使 pnpm --filter @kkfive/http-client test:run 可执行。',
    allowedPaths: ['packages/http-client/**'],
    expectedRules: ['packages.rule.md', 'testing.rule.md'],
    expectedSkills: ['coding-standards'],
    forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture', 'monorepo-engineering'],
    budgetTokens: 3000,
    requiredHitRate: 1,
    maxForbiddenCategoryHits: 0,
    gates: [
      { kind: 'command', command: 'pnpm --filter @kkfive/http-client test:run' },
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm verify' },
    ],
  },
  {
    id: 'monorepo-config',
    prompt: '为 CI 的 test/build job 持久化 Turbo cache，保持 verify 全量、PR affected 与 push 全量语义，并补充可复现验证。',
    allowedPaths: ['.github/workflows/ci.yml', 'turbo.json', 'package.json'],
    expectedRules: ['monorepo.rule.md'],
    expectedSkills: ['monorepo-engineering'],
    forbiddenCategories: ['nextjs-app-router', 'styling-system', 'coding-standards', 'project-architecture'],
    budgetTokens: 3000,
    requiredHitRate: 1,
    maxForbiddenCategoryHits: 0,
    gates: [
      { kind: 'command', command: 'pnpm verify' },
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'static', assertion: 'CI static governance remains full' },
      { kind: 'static', assertion: 'CI pull request test/build remain affected-only' },
      { kind: 'static', assertion: 'CI push test/build remain full' },
    ],
  },
] as const satisfies readonly GovernanceProfile[]
