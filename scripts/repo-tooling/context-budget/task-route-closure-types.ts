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
