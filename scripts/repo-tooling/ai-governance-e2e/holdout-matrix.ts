type EvidenceStrategy = 'characterization' | 'fixture' | 'mutation' | 'red'

type EvidenceGate = {
  command: string
  expectedExitCode: number
  failurePattern: string
  forbiddenFailurePatterns: readonly string[]
}

type GovernanceGate
  = | { command: string, kind: 'command' }
    | { assertion: string, kind: 'static' }

type HoldoutRoutingFileType = 'feature' | 'next-app' | 'package-source' | 'test' | 'workflow' | 'workspace-config'
type HoldoutIntent = 'bug-fix' | 'ci-semantics' | 'feature-delivery' | 'package-test-hardening'
type HoldoutBehaviorRisk = 'behavior-change' | 'bug-fix' | 'ci-semantics' | 'shared-contract'

type HoldoutRoutingContext = {
  fileTypes: readonly HoldoutRoutingFileType[]
  intent: HoldoutIntent
  targetPaths: readonly string[]
}

type HoldoutProfileContract = {
  allowedPaths: readonly string[]
  budgetTokens: number
  evidencePaths: readonly string[]
  evidenceStrategies: readonly EvidenceStrategy[]
  gates: readonly GovernanceGate[]
  id: string
  independentAcceptance: 'api' | 'browser' | 'reviewer'
  maxForbiddenCategoryHits: number
  prompt: string
  redGate: EvidenceGate
  regressionGates: readonly GovernanceGate[]
  requiredHitRate: number
  routing: HoldoutRoutingContext
}

type DerivedGovernanceExpectations = {
  expectedAgentEntries: readonly string[]
  expectedRules: readonly string[]
  expectedSkills: readonly string[]
  forbiddenCategories: readonly string[]
}

const GOVERNANCE_CATEGORIES = ['monorepo-engineering', 'nextjs-app-router', 'project-architecture', 'styling-system'] as const

export const holdoutRoutingMatrix = [
  {
    id: 'holdout-client-page',
    prompt: '把 apps/client 的账户设置页补完整：首屏数据放服务端拿，保存交互沿用现有表单和基础控件，再把必要测试补齐。',
    allowedPaths: ['apps/client/**'],
    budgetTokens: 1800,
    evidenceStrategies: ['red'],
    evidencePaths: ['apps/client/src/features/account-settings/**/*.test.ts', 'apps/client/src/features/account-settings/**/*.test.tsx'],
    gates: [
      { kind: 'command', command: 'pnpm --filter client test:run' },
    ],
    independentAcceptance: 'browser',
    maxForbiddenCategoryHits: 0,
    redGate: {
      command: 'pnpm --workspace-root exec vitest run apps/client/src/features/account --reporter=verbose',
      expectedExitCode: 1,
      failurePattern: '(ACCOUNT_SETTINGS_ROUTE_COMPOSITION_MISSING|ACCOUNT_SETTINGS_SERVER_PREFETCH_MISSING|ACCOUNT_SETTINGS_SAVE_INTERACTION_MISSING)',
      forbiddenFailurePatterns: ['ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY', 'Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND'],
    },
    regressionGates: [
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm verify' },
      { kind: 'command', command: 'pnpm --filter client build' },
    ],
    requiredHitRate: 1,
    routing: {
      intent: 'feature-delivery',
      fileTypes: ['next-app', 'feature', 'test'],
      targetPaths: [
        'apps/client/src/app/account/settings/page.tsx',
        'apps/client/src/features/account-settings/components/account-settings-form.tsx',
        'apps/client/src/features/account-settings/components/account-settings-form.test.tsx',
      ],
    },
  },
  {
    id: 'holdout-package-test',
    prompt: '给 packages/http-client 补齐错误路径、边界和网络隔离测试，并让这个包自己的 test:run 可以直接执行。',
    allowedPaths: ['packages/http-client/**'],
    budgetTokens: 1200,
    evidenceStrategies: ['characterization', 'mutation'],
    evidencePaths: ['packages/http-client/**/*.test.ts'],
    gates: [
      { kind: 'command', command: 'pnpm --filter @kkfive/http-client test:run' },
    ],
    independentAcceptance: 'reviewer',
    maxForbiddenCategoryHits: 0,
    redGate: {
      command: 'pnpm --workspace-root exec vitest run packages/http-client --reporter=verbose',
      expectedExitCode: 1,
      failurePattern: '(BUSINESS_ERROR_OPTIONS_PRESERVED|CREATE_ERROR_RESPONSE_ERROR_SHAPE_MISSING|HTTP_SERVICE_NETWORK_ISOLATION_MISSING)',
      forbiddenFailurePatterns: ['Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND', 'ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY'],
    },
    regressionGates: [
      { kind: 'command', command: 'pnpm --filter @kkfive/rpc typecheck' },
      { kind: 'command', command: 'pnpm --filter client test:run' },
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm verify' },
    ],
    requiredHitRate: 1,
    routing: {
      intent: 'package-test-hardening',
      fileTypes: ['package-source', 'test'],
      targetPaths: [
        'packages/http-client/src/error.test.ts',
        'packages/http-client/src/http-service.test.ts',
      ],
    },
  },
  {
    id: 'holdout-monorepo-cache',
    prompt: '让 CI 里的 test/build 复用 Turbo cache，同时继续保持 PR 只跑受影响、push 走全量，并给出能复现的校验。',
    allowedPaths: ['.github/workflows/ci.yml', 'turbo.json', 'package.json', 'scripts/repo-tooling/**'],
    budgetTokens: 1400,
    evidenceStrategies: ['fixture', 'red'],
    evidencePaths: ['scripts/repo-tooling/**/*.test.ts', 'scripts/repo-tooling/**/__fixtures__/**'],
    gates: [
      { kind: 'command', command: 'pnpm test:repo' },
      { kind: 'static', assertion: 'CI static governance remains full' },
      { kind: 'static', assertion: 'CI pull request test/build remain affected-only' },
      { kind: 'static', assertion: 'CI push test/build remain full' },
    ],
    independentAcceptance: 'reviewer',
    maxForbiddenCategoryHits: 0,
    redGate: {
      command: 'pnpm --workspace-root exec vitest run scripts/repo-tooling --reporter=verbose',
      expectedExitCode: 1,
      failurePattern: '(TURBO_CACHE_CI_SEMANTICS_MISSING|CI_PULL_REQUEST_AFFECTED_FILTER_MISSING|CI_PUSH_FULL_RUN_MISSING)',
      forbiddenFailurePatterns: ['Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND', 'ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY'],
    },
    regressionGates: [
      { kind: 'command', command: 'pnpm verify' },
      { kind: 'command', command: 'pnpm test:run' },
    ],
    requiredHitRate: 1,
    routing: {
      intent: 'ci-semantics',
      fileTypes: ['workflow', 'workspace-config', 'test'],
      targetPaths: [
        '.github/workflows/ci.yml',
        'scripts/repo-tooling/ai-governance-e2e/runner.test.ts',
        'turbo.json',
      ],
    },
  },
  {
    id: 'holdout-implicit-feature',
    prompt: '遵循项目规范完成 client 演示导航里无效查询参数的修复，并补上回归验证。',
    allowedPaths: ['apps/client/**'],
    budgetTokens: 1400,
    evidenceStrategies: ['red'],
    evidencePaths: ['apps/client/src/features/demo/navigation/**/*.test.ts', 'apps/client/src/features/demo/navigation/**/*.test.tsx'],
    gates: [
      { kind: 'command', command: 'pnpm --filter client test:run' },
    ],
    independentAcceptance: 'reviewer',
    maxForbiddenCategoryHits: 0,
    redGate: {
      command: 'pnpm --workspace-root exec vitest run apps/client/src/features/demo/navigation --reporter=verbose',
      expectedExitCode: 1,
      failurePattern: '(INVALID_NAVIGATION_QUERY_FALLBACK_MISSING|NAVIGATION_KEYBOARD_STATE_REGRESSION)',
      forbiddenFailurePatterns: ['Cannot find module', 'Failed to resolve import', 'No test files found', 'ERR_MODULE_NOT_FOUND', 'ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY'],
    },
    regressionGates: [
      { kind: 'command', command: 'pnpm test:run' },
      { kind: 'command', command: 'pnpm --filter client build' },
    ],
    requiredHitRate: 1,
    routing: {
      intent: 'bug-fix',
      fileTypes: ['feature', 'test'],
      targetPaths: [
        'apps/client/src/features/demo/navigation/navigation-menu.tsx',
        'apps/client/src/features/demo/navigation/navigation-menu.test.tsx',
      ],
    },
  },
] as const satisfies readonly HoldoutProfileContract[]

export function deriveGovernanceExpectations(context: HoldoutRoutingContext): DerivedGovernanceExpectations {
  const fileTypes = deriveHoldoutFileTypes(context.targetPaths)
  const declaredFileTypes = dedupe(context.fileTypes)
  if (declaredFileTypes.join('|') !== fileTypes.join('|'))
    throw new Error(`HOLDOUT_FILE_TYPES_MISMATCH:${declaredFileTypes.join(',')}!==${fileTypes.join(',')}`)
  const behaviorRisk = deriveBehaviorRisk(context.intent)
  const expectedAgentEntries = dedupe([
    'AGENTS.md',
    ...context.targetPaths
      .map(path => path.match(/^apps\/([^/]+)\//u)?.[1])
      .filter((appName): appName is string => typeof appName === 'string')
      .map(appName => `apps/${appName}/AGENTS.md`),
  ])

  const expectedRules = dedupe([
    ...(fileTypes.includes('feature') ? ['feature.rule.md'] : []),
    ...(fileTypes.includes('next-app') ? ['next-app.rule.md'] : []),
    ...(fileTypes.includes('package-source') ? ['packages.rule.md'] : []),
    ...(fileTypes.includes('workflow') || fileTypes.includes('workspace-config') ? ['monorepo.rule.md'] : []),
    ...(fileTypes.includes('test') ? ['testing.rule.md'] : []),
  ])

  const expectedSkills = dedupe([
    ...(behaviorRisk.length > 0 ? ['evidence-first-development'] : []),
    ...(fileTypes.includes('next-app') ? ['nextjs-app-router'] : []),
    ...(fileTypes.some(fileType => ['feature', 'next-app', 'package-source', 'test'].includes(fileType)) ? ['coding-standards'] : []),
    ...(behaviorRisk.includes('ci-semantics') || fileTypes.includes('workflow') || fileTypes.includes('workspace-config') ? ['monorepo-engineering'] : []),
  ])

  const allowedCategories = new Set(expectedSkills.filter(skill => GOVERNANCE_CATEGORIES.includes(skill as typeof GOVERNANCE_CATEGORIES[number])))
  const forbiddenCategories = GOVERNANCE_CATEGORIES.filter(category => !allowedCategories.has(category))

  return {
    expectedAgentEntries,
    expectedRules,
    expectedSkills,
    forbiddenCategories,
  }
}

export function deriveHoldoutFileTypes(targetPaths: readonly string[]): readonly HoldoutRoutingFileType[] {
  return [...new Set(targetPaths.flatMap((targetPath) => {
    const types: HoldoutRoutingFileType[] = []
    if (/^apps\/[^/]+\/src\/app\//u.test(targetPath))
      types.push('next-app')
    if (/^apps\/[^/]+\/src\/features\//u.test(targetPath))
      types.push('feature')
    if (/^packages\//u.test(targetPath))
      types.push('package-source')
    if (/^\.github\/workflows\//u.test(targetPath))
      types.push('workflow')
    if (/^(?:turbo\.json|pnpm-workspace\.yaml|package\.json)$/u.test(targetPath) || /^(?:internal|scripts\/repo-tooling)\//u.test(targetPath))
      types.push('workspace-config')
    if (/(?:^|\/)(?:__fixtures__|fixtures?)(?:\/|$)/u.test(targetPath) || /\.(?:spec|test)\.[cm]?[jt]sx?$/u.test(targetPath))
      types.push('test')
    return types
  }))] as readonly HoldoutRoutingFileType[]
}

function deriveBehaviorRisk(intent: HoldoutIntent): readonly HoldoutBehaviorRisk[] {
  switch (intent) {
    case 'bug-fix':
      return ['behavior-change', 'bug-fix']
    case 'ci-semantics':
      return ['ci-semantics']
    case 'feature-delivery':
      return ['behavior-change']
    case 'package-test-hardening':
      return ['behavior-change', 'shared-contract']
  }
}

export const holdoutMatrixProfiles = holdoutRoutingMatrix.map(({ routing, ...contract }) => ({
  ...contract,
  ...deriveGovernanceExpectations(routing),
  calibration: false,
  holdout: true,
}))

function dedupe<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)]
}
