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
  checkId: 'AIFA001' | 'AIFA002' | 'AIFA003' | 'AIFA004'
  evidence: AuditEvidence
  message: string
  relatedLocations?: AuditLocation[]
  severity: AuditSeverity
}

export type AuditMetrics = {
  estimatedTokens: number
  governanceBytes: number
  governanceFiles: number
}

export type AuditReport = {
  schemaVersion: 'ai-friendliness-audit/1'
  rootDir: string
  verdict: 'failed' | 'passed'
  metrics: AuditMetrics
  findings: AuditFinding[]
}

export type AuditConfig = {
  documentTokenBudget: number
  duplicateMinimumCharacters: number
}

export type RunStaticAuditOptions = {
  config?: Partial<AuditConfig>
  rootDir: string
}
