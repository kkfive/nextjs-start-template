export type AiFriendlinessCheckId
  = | 'architecture-governance'
    | 'independent-acceptance'
    | 'production-static-governance'
    | 'real-agent-technical'
    | 'tooling-regression'
    | 'workspace-governance'

export type AiFriendlinessCheckStatus
  = | 'acceptance_pending'
    | 'failed'
    | 'infrastructure_error'
    | 'not_run'
    | 'passed'

export type AiFriendlinessCheckDefinition = {
  command: readonly string[] | null
  defaultMode: 'always' | 'external-evidence'
  id: AiFriendlinessCheckId
}

export const aiFriendlinessCheckDefinitions: readonly AiFriendlinessCheckDefinition[] = [
  {
    command: ['pnpm', 'run', 'test:ai-governance-tooling'],
    defaultMode: 'always',
    id: 'tooling-regression',
  },
  {
    command: ['pnpm', 'run', 'audit:ai-friendliness'],
    defaultMode: 'always',
    id: 'production-static-governance',
  },
  {
    command: ['pnpm', 'run', 'verify:architecture'],
    defaultMode: 'always',
    id: 'architecture-governance',
  },
  {
    command: ['pnpm', 'run', 'verify:workspaces'],
    defaultMode: 'always',
    id: 'workspace-governance',
  },
  {
    command: null,
    defaultMode: 'external-evidence',
    id: 'real-agent-technical',
  },
  {
    command: null,
    defaultMode: 'external-evidence',
    id: 'independent-acceptance',
  },
]

export type AiFriendlinessCheckResult = {
  command: readonly string[] | null
  id: AiFriendlinessCheckId
  status: AiFriendlinessCheckStatus
}

export type AiFriendlinessGateReport = {
  checks: readonly AiFriendlinessCheckResult[]
  schemaVersion: 'ai-friendliness-gate/1'
  verdict: 'failed' | 'passed' | 'passed-with-external-evidence-pending'
}

export function aggregateAiFriendlinessChecks(checks: readonly AiFriendlinessCheckResult[]): AiFriendlinessGateReport {
  const failed = checks.some(check => check.status === 'failed' || check.status === 'infrastructure_error')
  const externalChecks = checks.filter(check => (
    check.id === 'real-agent-technical' || check.id === 'independent-acceptance'
  ))
  const externalEvidencePassed = externalChecks.length === 2 && externalChecks.every(check => check.status === 'passed')
  return {
    checks,
    schemaVersion: 'ai-friendliness-gate/1',
    verdict: failed ? 'failed' : externalEvidencePassed ? 'passed' : 'passed-with-external-evidence-pending',
  }
}
