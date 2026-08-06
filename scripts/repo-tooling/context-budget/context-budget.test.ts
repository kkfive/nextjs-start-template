import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import {
  applyReadDefaults,
  buildTaskContextPacket,
  createDiscoveryBudget,
  evaluateDiscoveryCall,
  isDiscoveryShellCommand,
  normalizeProjectPath,
  truncateToolText,
} from './context-budget.ts'

describe('context budget', () => {
  it('builds a deterministic, deduplicated packet within the byte budget', () => {
    const packet = buildTaskContextPacket({
      files: [
        { bytes: 5, content: 'alpha', path: 'AGENTS.md', priority: 0 },
        { bytes: 4, content: 'beta', path: '.agents/rules/a.md', priority: 1 },
        { bytes: 5, content: 'alpha', path: 'AGENTS.md', priority: 2 },
        { bytes: 5, content: 'gamma', path: '.agents/rules/b.md', priority: 3 },
      ],
      maxBytes: 10,
    })

    expect(packet.files.map(file => file.path)).toEqual(['AGENTS.md', '.agents/rules/a.md'])
    expect(packet.totalBytes).toBe(9)
    expect(packet.omitted).toEqual(['.agents/rules/b.md'])
  })

  it('narrows unbounded reads but preserves stricter caller limits', () => {
    expect(applyReadDefaults({ path: 'src/a.ts' }, { maxReadLines: 200 })).toEqual({
      limit: 200,
      offset: 1,
      path: 'src/a.ts',
    })
    expect(applyReadDefaults({ limit: 40, offset: 10, path: 'src/a.ts' }, { maxReadLines: 200 })).toEqual({
      limit: 40,
      offset: 10,
      path: 'src/a.ts',
    })
  })

  it('blocks repeated reads of the same normalized range', () => {
    const budget = createDiscoveryBudget({ hardLimit: 3, warningAt: 2 })
    expect(evaluateDiscoveryCall(budget, { key: 'read:src/a.ts:1:200', kind: 'read' }).decision).toBe('allow')
    expect(evaluateDiscoveryCall(budget, { key: 'read:src/a.ts:1:200', kind: 'read' })).toMatchObject({
      decision: 'block_duplicate',
    })
  })

  it('warns before the hard discovery limit and blocks after it', () => {
    const budget = createDiscoveryBudget({ hardLimit: 3, warningAt: 2 })
    expect(evaluateDiscoveryCall(budget, { key: 'search:a', kind: 'search' }).decision).toBe('allow')
    expect(evaluateDiscoveryCall(budget, { key: 'search:b', kind: 'search' }).decision).toBe('warn')
    expect(evaluateDiscoveryCall(budget, { key: 'search:c', kind: 'search' }).decision).toBe('allow')
    expect(evaluateDiscoveryCall(budget, { key: 'search:d', kind: 'search' }).decision).toBe('block_budget')
  })

  it('normalizes equivalent project-relative read paths', () => {
    expect(normalizeProjectPath('/repo', './src/a.ts')).toBe('src/a.ts')
    expect(normalizeProjectPath('/repo', '/repo/src/a.ts')).toBe('src/a.ts')
    expect(normalizeProjectPath('/repo', '../outside.ts')).toBe('../outside.ts')
  })

  it('classifies only wholly read-only discovery shell commands', () => {
    expect(isDiscoveryShellCommand('rg -n "account" apps/client')).toBe(true)
    expect(isDiscoveryShellCommand('find apps -type f')).toBe(true)
    expect(isDiscoveryShellCommand('rg account && find apps -type f')).toBe(true)
    expect(isDiscoveryShellCommand('pnpm test:repo')).toBe(false)
    expect(isDiscoveryShellCommand('git diff --check')).toBe(false)
    expect(isDiscoveryShellCommand('pnpm test || tail -n 100 report.log')).toBe(false)
    expect(isDiscoveryShellCommand('sed -n 1,20p file.ts')).toBe(false)
    expect(isDiscoveryShellCommand('awk /name/ file.ts')).toBe(false)
    expect(isDiscoveryShellCommand('sed -i s/old/new/ file.ts')).toBe(false)
    expect(isDiscoveryShellCommand('sed --in-place s/old/new/ file.ts')).toBe(false)
    expect(isDiscoveryShellCommand('find apps -delete')).toBe(false)
    expect(isDiscoveryShellCommand('cat file & sed -i s/old/new/ file')).toBe(false)
    expect(isDiscoveryShellCommand('printf data | rg data')).toBe(false)
  })

  it('preserves text that is already within both limits', () => {
    const text = '你\n好'
    expect(truncateToolText(text, { maxBytes: 100, maxLines: 10 })).toMatchObject({
      content: text,
      outputBytes: Buffer.byteLength(text),
      truncated: false,
    })
  })

  it('keeps a UTF-8-safe suffix when byte pressure truncates long lines', () => {
    const result = truncateToolText(`${'😀'.repeat(4000)}\n${'尾'.repeat(4000)}`, { maxBytes: 4096, maxLines: 5 })
    expect(result.truncated).toBe(true)
    expect(result.content).toContain('😀')
    expect(result.content).toContain('尾')
    expect(result.content).not.toContain('�')
    expect(result.outputBytes).toBeLessThanOrEqual(4096)
    expect(result.outputLines).toBeLessThanOrEqual(5)
  })

  it('preserves both the beginning and end within the declared result budget', () => {
    const result = truncateToolText('one\ntwo\nthree\nfour', { maxBytes: 200, maxLines: 3 })
    expect(result.truncated).toBe(true)
    expect(result.content).toContain('one')
    expect(result.content).toContain('four')
    expect(result.content).toContain('2 lines omitted')
    expect(result.outputBytes).toBeLessThanOrEqual(200)
    expect(result.outputLines).toBeLessThanOrEqual(3)
    expect(result.totalLines).toBe(4)
  })
})
