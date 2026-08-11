import { holdoutMatrixProfiles } from './holdout-matrix.ts'

export type EvidenceStrategy = 'characterization' | 'fixture' | 'mutation' | 'red'

export type EvidenceGate = {
  command: string
  expectedExitCode: number
  failurePattern: string
  forbiddenFailurePatterns: readonly string[]
}

export type GovernanceGate
  = | { command: string, kind: 'command' }
    | { assertion: string, kind: 'static' }

export type GovernanceProfile = {
  allowedPaths: readonly string[]
  budgetTokens: number
  calibration?: boolean
  evidencePaths?: readonly string[]
  evidenceStrategies?: readonly EvidenceStrategy[]
  expectedAgentEntries: readonly string[]
  expectedRules: readonly string[]
  expectedSkills: readonly string[]
  forbiddenCategories: readonly string[]
  gates: readonly GovernanceGate[]
  holdout?: boolean
  id: string
  independentAcceptance: 'api' | 'browser' | 'reviewer'
  maxForbiddenCategoryHits: number
  prompt: string
  redGate?: EvidenceGate
  regressionGates?: readonly GovernanceGate[]
  requiredHitRate: number
}

export const profiles = [
  {
    id: 'next-page',
    prompt: '在 apps/client 新增账户设置页面：路由只组合 feature 公开入口，Server Component 获取首屏数据，Client Component 使用现有表单与共享基础控件完成保存交互；补齐必要测试。',
    allowedPaths: ['apps/client/**'],
    expectedAgentEntries: ['AGENTS.md', 'apps/client/AGENTS.md'],
    expectedRules: ['feature.rule.md', 'next-app.rule.md', 'testing.rule.md'],
    expectedSkills: ['evidence-first-development', 'nextjs-app-router', 'coding-standards'],
    forbiddenCategories: ['project-architecture', 'styling-system', 'monorepo-engineering'],
    evidenceStrategies: ['red'],
    evidencePaths: ['apps/client/src/features/account-settings/**/*.test.ts', 'apps/client/src/features/account-settings/**/*.test.tsx'],
    redGate: { command: 'pnpm --workspace-root exec vitest run apps/client/src/features/account --reporter=verbose', expectedExitCode: 1, failurePattern: '(ACCOUNT_SETTINGS_ROUTE_COMPOSITION_MISSING|ACCOUNT_SETTINGS_SERVER_PREFETCH_MISSING|ACCOUNT_SETTINGS_SAVE_INTERACTION_MISSING)', forbiddenFailurePatterns: ['ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY', 'Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND'] },
    independentAcceptance: 'browser',
    budgetTokens: 1800,
    requiredHitRate: 1,
    maxForbiddenCategoryHits: 0,
    gates: [
      { kind: 'command', command: 'pnpm --filter client test:run' },
    ],
    regressionGates: [
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm verify' },
      { kind: 'command', command: 'pnpm --filter client build' },
    ],
  },
  {
    id: 'package-test',
    prompt: '为 packages/http-client 的 BusinessError、createErrorResponse 和 HttpService 增加错误路径、边界与网络隔离测试；在该 package 内补齐 test:run，使 pnpm --filter @kkfive/http-client test:run 可执行。',
    allowedPaths: ['packages/http-client/**'],
    expectedAgentEntries: ['AGENTS.md'],
    expectedRules: ['packages.rule.md', 'testing.rule.md'],
    expectedSkills: ['evidence-first-development', 'coding-standards'],
    forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture', 'monorepo-engineering'],
    evidenceStrategies: ['characterization', 'mutation'],
    evidencePaths: ['packages/http-client/**/*.test.ts'],
    redGate: { command: 'pnpm --workspace-root exec vitest run packages/http-client --reporter=verbose', expectedExitCode: 1, failurePattern: '(BUSINESS_ERROR_OPTIONS_PRESERVED|CREATE_ERROR_RESPONSE_ERROR_SHAPE_MISSING|HTTP_SERVICE_NETWORK_ISOLATION_MISSING)', forbiddenFailurePatterns: ['Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND', 'ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY'] },
    independentAcceptance: 'reviewer',
    budgetTokens: 1200,
    requiredHitRate: 1,
    maxForbiddenCategoryHits: 0,
    gates: [
      { kind: 'command', command: 'pnpm --filter @kkfive/http-client test:run' },
    ],
    regressionGates: [
      { kind: 'command', command: 'pnpm --filter @kkfive/rpc typecheck' },
      { kind: 'command', command: 'pnpm --filter client test:run' },
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm verify' },
    ],
  },
  {
    id: 'monorepo-config',
    prompt: '为 CI 的 test/build job 持久化 Turbo cache，保持 verify 全量、PR affected 与 push 全量语义，并补充可复现验证。',
    allowedPaths: ['.github/workflows/ci.yml', 'turbo.json', 'package.json', 'scripts/repo-tooling/**'],
    expectedAgentEntries: ['AGENTS.md'],
    expectedRules: ['monorepo.rule.md', 'testing.rule.md'],
    expectedSkills: ['evidence-first-development', 'monorepo-engineering', 'coding-standards'],
    forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture'],
    evidenceStrategies: ['fixture', 'red'],
    evidencePaths: ['scripts/repo-tooling/**/*.test.ts', 'scripts/repo-tooling/**/__fixtures__/**'],
    redGate: { command: 'pnpm --workspace-root exec vitest run scripts/repo-tooling --reporter=verbose', expectedExitCode: 1, failurePattern: '(TURBO_CACHE_CI_SEMANTICS_MISSING|CI_PULL_REQUEST_AFFECTED_FILTER_MISSING|CI_PUSH_FULL_RUN_MISSING)', forbiddenFailurePatterns: ['Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND', 'ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY'] },
    independentAcceptance: 'reviewer',
    budgetTokens: 1400,
    requiredHitRate: 1,
    maxForbiddenCategoryHits: 0,
    gates: [
      { kind: 'command', command: 'pnpm test:repo' },
      { kind: 'static', assertion: 'CI static governance remains full' },
      { kind: 'static', assertion: 'CI pull request test/build remain affected-only' },
      { kind: 'static', assertion: 'CI push test/build remain full' },
    ],
    regressionGates: [
      { kind: 'command', command: 'pnpm verify' },
      { kind: 'command', command: 'pnpm test:run' },
    ],
  },
  {
    id: 'bug-fix',
    prompt: '修复 client 演示导航在无效查询参数下选择不存在菜单项的问题，保持合法导航和键盘操作不变，并补充回归验证。',
    allowedPaths: ['apps/client/**'],
    expectedAgentEntries: ['AGENTS.md', 'apps/client/AGENTS.md'],
    expectedRules: ['feature.rule.md', 'testing.rule.md'],
    expectedSkills: ['evidence-first-development', 'coding-standards'],
    forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture', 'monorepo-engineering'],
    evidenceStrategies: ['red'],
    evidencePaths: ['apps/client/src/features/demo/navigation/**/*.test.ts', 'apps/client/src/features/demo/navigation/**/*.test.tsx'],
    redGate: { command: 'pnpm --workspace-root exec vitest run apps/client/src/features/demo/navigation --reporter=verbose', expectedExitCode: 1, failurePattern: '(INVALID_NAVIGATION_QUERY_FALLBACK_MISSING|NAVIGATION_KEYBOARD_STATE_REGRESSION)', forbiddenFailurePatterns: ['Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND', 'ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY'] },
    independentAcceptance: 'reviewer',
    budgetTokens: 1400,
    requiredHitRate: 1,
    maxForbiddenCategoryHits: 0,
    gates: [
      { kind: 'command', command: 'pnpm --filter client test:run' },
    ],
    regressionGates: [
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm --filter client build' },
    ],
  },
  ...holdoutMatrixProfiles,
] as const satisfies readonly GovernanceProfile[]

const allProfiles: readonly GovernanceProfile[] = profiles

export const runProfiles = allProfiles.filter(profile => profile.holdout !== true)
export const holdoutProfiles = allProfiles.filter(profile => profile.holdout === true)
export const calibrationProfiles = allProfiles.filter(profile => profile.calibration !== false)
