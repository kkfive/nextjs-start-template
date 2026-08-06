import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { runAiFriendlinessGate } from './runner.ts'

describe('unified AI friendliness gate runner', () => {
  it('runs every deterministic gate and reports explicit external not-run states', () => {
    const commands: string[] = []
    const report = runAiFriendlinessGate({
      execute: (command) => {
        commands.push(command.join(' '))
        return 0
      },
    })

    expect(commands).toEqual([
      'pnpm run test:ai-governance-tooling',
      'pnpm run audit:ai-friendliness',
      'pnpm run verify:architecture',
      'pnpm run verify:workspaces',
    ])
    expect(report.checks).toContainEqual(expect.objectContaining({ id: 'real-agent-technical', status: 'not_run' }))
    expect(report.checks).toContainEqual(expect.objectContaining({ id: 'independent-acceptance', status: 'not_run' }))
    expect(report.verdict).toBe('passed-with-external-evidence-pending')
  })

  it('stops after a deterministic failure and marks later layers not run', () => {
    let invocation = 0
    const report = runAiFriendlinessGate({ execute: () => (++invocation === 2 ? 1 : 0) })

    expect(invocation).toBe(2)
    expect(report.checks).toContainEqual(expect.objectContaining({ id: 'production-static-governance', status: 'failed' }))
    expect(report.checks).toContainEqual(expect.objectContaining({ id: 'architecture-governance', status: 'not_run' }))
    expect(report.verdict).toBe('failed')
  })

  it('consumes explicit external evidence without asking', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-friendliness-gate-evidence-'))
    try {
      const technical = path.join(temporaryRoot, 'technical.json')
      const acceptance = path.join(temporaryRoot, 'acceptance.json')
      fs.writeFileSync(technical, JSON.stringify({ status: 'technical_passed' }))
      fs.writeFileSync(acceptance, JSON.stringify({ status: 'independently_verified' }))
      const report = runAiFriendlinessGate({
        acceptanceEvidence: acceptance,
        execute: () => 0,
        technicalEvidence: technical,
      })

      expect(report.verdict).toBe('passed')
    }
    finally { fs.rmSync(temporaryRoot, { force: true, recursive: true }) }
  })

  it('fails for a missing evidence path instead of silently omitting it', () => {
    const report = runAiFriendlinessGate({ execute: () => 0, technicalEvidence: '/definitely/missing/evidence.json' })

    expect(report.checks).toContainEqual(expect.objectContaining({ id: 'real-agent-technical', status: 'infrastructure_error' }))
    expect(report.verdict).toBe('failed')
  })
})
