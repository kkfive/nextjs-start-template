export type AuditSeverity = 'error' | 'warning'

export type AuditLocation = {
  file: string
  line: number
}

export type AuditEvidence = {
  kind: 'filesystem' | 'route' | 'similarity' | 'token-budget'
  details: Record<string, number | string>
}

export type AuditFinding = AuditLocation & {
  checkId: 'AIFA001' | 'AIFA002' | 'AIFA003' | 'AIFA004' | 'AIFA005'
  evidence: AuditEvidence
  message: string
  relatedLocations?: AuditLocation[]
  severity: AuditSeverity
}

export type AuditMetrics = {
  governanceCorpusEstimatedTokens: number
  /** @deprecated backward-compatible alias of governanceCorpusEstimatedTokens */
  estimatedTokens: number
  governanceBytes: number
  governanceFiles: number
}

export type TaskRouteClosureInput = {
  intentNames?: readonly string[]
  skillNames?: readonly string[]
  targetPaths: readonly string[]
  testRisk?: boolean | 'none' | 'required'
}

export type TaskRouteClosureNormalizedInput = {
  intentNames: readonly string[]
  requiresTestingRule: boolean
  skillNames: readonly string[]
  targetPaths: readonly string[]
  testRisk: 'none' | 'required'
}

export type TaskRouteClosureFile = {
  bytes: number
  depth: number
  estimatedTokens: number
  kind: 'agents' | 'reference' | 'rule' | 'skill'
  path: string
  reasons: readonly string[]
}

export type TaskRouteClosureEdge = {
  detail?: string
  from: string
  kind: 'intent-route' | 'markdown-reference' | 'path-route' | 'scoped-entry' | 'selected-skill' | 'test-overlay'
  line?: number
  to: string
}

export type TaskRouteClosureCycle = {
  path: readonly string[]
}

export type TaskRouteClosureMissingReference = {
  from: string
  line: number
  reference: string
  resolvedPath: string
}

export type TaskRouteClosureStats = {
  branchCount: number
  edgeCount: number
  maxBranchingFactor: number
  maxDepth: number
  uniqueBytes: number
  uniqueEstimatedTokens: number
}

export type TaskRouteClosureReport = {
  cycles: readonly TaskRouteClosureCycle[]
  edges: readonly TaskRouteClosureEdge[]
  files: readonly TaskRouteClosureFile[]
  input: TaskRouteClosureNormalizedInput
  missingReferences: readonly TaskRouteClosureMissingReference[]
  stats: TaskRouteClosureStats
}

export type AuditReport = {
  schemaVersion: 'ai-friendliness-audit/1'
  rootDir: string
  verdict: 'failed' | 'passed'
  metrics: AuditMetrics
  findings: AuditFinding[]
  taskRouteClosure?: TaskRouteClosureReport
}

export type AuditConfig = {
  documentTokenBudget: number
  duplicateMinimumCharacters: number
}

export type RunStaticAuditOptions = {
  config?: Partial<AuditConfig>
  rootDir: string
  taskRouteClosureInput?: TaskRouteClosureInput
}
