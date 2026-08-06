import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { runStaticAudit } from './static-audit.ts'
import { calculateTaskRouteClosure } from './task-route-closure.ts'

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

  it('fails closed when the root AGENTS entry is missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-root-agents-'))
    try {
      writeFixture(root, { '.agents/rules/example.rule.md': '# Example' })
      const report = runStaticAudit({ rootDir: root })

      expect(report.verdict).toBe('failed')
      expect(report.findings).toContainEqual(expect.objectContaining({ checkId: 'AIFA005', file: 'AGENTS.md' }))
    }
    finally { fs.rmSync(root, { force: true, recursive: true }) }
  })

  it('reports corpus cost separately from a task route closure', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'task-route-closure-'))
    try {
      writeFixture(root, {
        'AGENTS.md': ['# Router', '| path | rule |', '|---|---|', '| `apps/*/src/features/**` | `.agents/rules/feature.rule.md` |', '| `**/*.test.*` | `.agents/rules/testing.rule.md` |', '- TypeScript：`coding-standards`'].join('\n'),
        'apps/client/AGENTS.md': '# Client',
        '.agents/rules/feature.rule.md': '# Feature',
        '.agents/rules/testing.rule.md': '# Testing',
        '.agents/skills/coding-standards/SKILL.md': '# Coding\n\nRead `references/typescript.md`.',
        '.agents/skills/coding-standards/references/typescript.md': '# TypeScript',
        '.agents/skills/unrelated/SKILL.md': '# Unrelated governance content that must stay outside this task closure.',
      })
      const report = runStaticAudit({ rootDir: root, taskRouteClosureInput: { intentNames: ['TypeScript'], targetPaths: ['apps/client/src/features/account/model.test.ts'] } })

      expect(report.metrics.governanceCorpusEstimatedTokens).toBeGreaterThan(0)
      expect(report.taskRouteClosure?.files.map(file => file.path)).toEqual([
        '.agents/rules/feature.rule.md',
        '.agents/rules/testing.rule.md',
        '.agents/skills/coding-standards/references/typescript.md',
        '.agents/skills/coding-standards/SKILL.md',
        'AGENTS.md',
        'apps/client/AGENTS.md',
      ])
      expect(report.taskRouteClosure?.stats.maxDepth).toBe(2)
      expect(report.taskRouteClosure?.stats.uniqueEstimatedTokens).toBeLessThan(report.metrics.governanceCorpusEstimatedTokens)
    }
    finally { fs.rmSync(root, { force: true, recursive: true }) }
  })

  it('matches an independently reviewed closure for representative production tasks', () => {
    const root = path.resolve('.')
    const cases = [
      {
        expected: ['.agents/rules/monorepo.rule.md', '.agents/skills/monorepo-engineering/SKILL.md', 'AGENTS.md'],
        input: { intentNames: ['Turbo'], targetPaths: ['.github/workflows/ci.yml'] },
      },
      {
        expected: ['.agents/rules/packages.rule.md', '.agents/rules/testing.rule.md', '.agents/skills/coding-standards/SKILL.md', 'AGENTS.md'],
        input: { intentNames: ['TypeScript'], targetPaths: ['packages/http-client/src/error.test.ts'] },
      },
    ] as const

    for (const testCase of cases) {
      const files = calculateTaskRouteClosure(root, testCase.input).files.map(file => file.path)
      expect(files).toEqual(expect.arrayContaining([...testCase.expected]))
    }
  })

  it('reports cycles and missing references in a selected Skill closure', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'task-route-cycle-'))
    try {
      writeFixture(root, {
        'AGENTS.md': '# Router',
        '.agents/skills/example/SKILL.md': '# Skill\n\nSee `references/a.md` and `references/missing.md`.',
        '.agents/skills/example/references/a.md': '# A\n\nSee `../SKILL.md`.',
      })
      const closure = calculateTaskRouteClosure(root, { skillNames: ['example'], targetPaths: ['src/example.ts'] })
      expect(closure.cycles).toHaveLength(1)
      expect(closure.missingReferences).toEqual([expect.objectContaining({ reference: 'references/missing.md' })])
    }
    finally { fs.rmSync(root, { force: true, recursive: true }) }
  })

  it('does not read a Markdown reference through a symlink that escapes the repository', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'task-route-symlink-root-'))
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'task-route-symlink-outside-'))
    try {
      writeFixture(root, {
        'AGENTS.md': '# Router',
        '.agents/skills/example/SKILL.md': '# Skill\n\nSee `references/outside.md`.',
      })
      fs.mkdirSync(path.join(root, '.agents/skills/example/references'), { recursive: true })
      fs.writeFileSync(path.join(outside, 'outside.md'), '# External secret')
      fs.symlinkSync(path.join(outside, 'outside.md'), path.join(root, '.agents/skills/example/references/outside.md'))

      const closure = calculateTaskRouteClosure(root, { skillNames: ['example'], targetPaths: ['src/example.ts'] })

      expect(closure.files.map(file => file.path)).not.toContain('.agents/skills/example/references/outside.md')
      expect(closure.missingReferences).toEqual([expect.objectContaining({ reference: 'references/outside.md' })])
    }
    finally {
      fs.rmSync(root, { force: true, recursive: true })
      fs.rmSync(outside, { force: true, recursive: true })
    }
  })

  it('does not read an initial route or selected Skill through paths that escape the repository', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'task-route-initial-root-'))
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'task-route-initial-outside-'))
    try {
      writeFixture(root, {
        'AGENTS.md': '| 路径 | 读取 |\n|---|---|\n| `src/**` | `outside.rule.md` |',
      })
      fs.writeFileSync(path.join(outside, 'secret.md'), '# External secret')
      fs.symlinkSync(path.join(outside, 'secret.md'), path.join(root, 'outside.rule.md'))

      const closure = calculateTaskRouteClosure(root, {
        skillNames: ['../../../outside'],
        targetPaths: ['src/example.ts'],
      })

      expect(closure.files.map(file => file.path)).toEqual(['AGENTS.md'])
    }
    finally {
      fs.rmSync(root, { force: true, recursive: true })
      fs.rmSync(outside, { force: true, recursive: true })
    }
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

function writeFixture(root: string, files: Record<string, string>): void {
  for (const [relativePath, content] of Object.entries(files)) {
    const file = path.join(root, relativePath)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
}
