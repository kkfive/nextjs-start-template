import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { runStaticAudit } from './static-audit.ts'

const fixtureRoot = fileURLToPath(new URL('./__fixtures__/', import.meta.url))

function fixture(name: string): string {
  return path.join(fixtureRoot, name)
}

describe('ai friendliness static audit', () => {
  it('accepts a small, routed governance fixture', () => {
    const report = runStaticAudit({ rootDir: fixture('valid') })

    expect(report.verdict).toBe('passed')
    expect(report.findings.filter(finding => finding.severity === 'error')).toEqual([])
    expect(report.metrics.governanceFiles).toBeGreaterThan(0)
  })

  it('reports duplicate normative owners with both locations', () => {
    const report = runStaticAudit({ rootDir: fixture('duplicate') })
    const finding = report.findings.find(item => item.checkId === 'AIFA002')

    expect(finding).toMatchObject({ severity: 'warning' })
    expect(finding?.relatedLocations).toHaveLength(1)
    expect(finding?.file).toContain('.agents/rules/first.rule.md')
    expect(finding?.relatedLocations?.[0]?.file).toContain('.agents/rules/second.rule.md')
  })

  it('reports a document budget excess without treating the heuristic as a hard failure', () => {
    const report = runStaticAudit({
      config: { documentTokenBudget: 40 },
      rootDir: fixture('budget-exceeded'),
    })
    const finding = report.findings.find(item => item.checkId === 'AIFA003')

    expect(finding).toMatchObject({ severity: 'warning' })
    expect(finding?.evidence).toMatchObject({ kind: 'token-budget' })
  })

  it('fails for a stale local Markdown reference', () => {
    const report = runStaticAudit({ rootDir: fixture('stale-reference') })

    expect(report.verdict).toBe('failed')
    expect(report.findings).toContainEqual(expect.objectContaining({
      checkId: 'AIFA004',
      line: 5,
      severity: 'error',
    }))
  })

  it('fails for a stale inline-code Markdown path', () => {
    const report = runStaticAudit({ rootDir: fixture('stale-inline-reference') })

    expect(report.verdict).toBe('failed')
    expect(report.findings).toContainEqual(expect.objectContaining({
      checkId: 'AIFA004',
      line: 3,
      severity: 'error',
    }))
  })

  it('does not treat a rule path outside the routing table as a route', () => {
    const report = runStaticAudit({ rootDir: fixture('fake-route-text') })

    expect(report.verdict).toBe('failed')
    expect(report.findings).toContainEqual(expect.objectContaining({
      checkId: 'AIFA001',
      severity: 'error',
    }))
  })

  it('fails when a rule has no route from the root AGENTS entry', () => {
    const report = runStaticAudit({ rootDir: fixture('orphan-route') })

    expect(report.verdict).toBe('failed')
    expect(report.findings).toContainEqual(expect.objectContaining({
      checkId: 'AIFA001',
      file: expect.stringContaining('.agents/rules/orphan.rule.md'),
      severity: 'error',
    }))
  })
})
