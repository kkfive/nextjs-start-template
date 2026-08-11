import type { AiFriendlinessCheckResult } from './contract.ts'
import { describe, expect, it } from 'vitest'
import { aggregateAiFriendlinessChecks, aiFriendlinessCheckDefinitions } from './contract.ts'

const expectedCheckIds = [
  'tooling-regression',
  'production-static-governance',
  'architecture-governance',
  'workspace-governance',
  'real-agent-technical',
  'independent-acceptance',
]

function results(statuses: Partial<Record<string, AiFriendlinessCheckResult['status']>> = {}): AiFriendlinessCheckResult[] {
  return aiFriendlinessCheckDefinitions.map(definition => ({
    command: definition.command,
    id: definition.id,
    status: statuses[definition.id] ?? (definition.defaultMode === 'always' ? 'passed' : 'not_run'),
  }))
}

describe('unified AI friendliness gate contract', () => {
  it('keeps the complete independently reviewed gate inventory', () => {
    expect(aiFriendlinessCheckDefinitions.map(check => check.id)).toEqual(expectedCheckIds)
    expect(aiFriendlinessCheckDefinitions.filter(check => check.defaultMode === 'always').map(check => check.id)).toEqual(expectedCheckIds.slice(0, 4))
  })

  it('does not present deterministic success as complete external acceptance', () => {
    expect(aggregateAiFriendlinessChecks(results())).toMatchObject({
      verdict: 'passed-with-external-evidence-pending',
    })
  })

  it('propagates deterministic and infrastructure failures', () => {
    expect(aggregateAiFriendlinessChecks(results({ 'workspace-governance': 'failed' })).verdict).toBe('failed')
    expect(aggregateAiFriendlinessChecks(results({ 'real-agent-technical': 'infrastructure_error' })).verdict).toBe('failed')
  })

  it('reports a complete pass only when both external evidence layers passed', () => {
    expect(aggregateAiFriendlinessChecks(results({
      'independent-acceptance': 'passed',
      'real-agent-technical': 'passed',
    })).verdict).toBe('passed')
  })
})
