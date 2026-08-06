import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createTaskContextPacket, renderTaskContextPacket } from './task-context.ts'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { force: true, recursive: true })
})

describe('task context packet', () => {
  it('materializes only the routed governance closure', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'task-context-'))
    roots.push(root)
    fs.mkdirSync(path.join(root, '.agents/rules'), { recursive: true })
    fs.writeFileSync(path.join(root, 'AGENTS.md'), [
      '# Root',
      '',
      '| path | read |',
      '|---|---|',
      '| `src/**` | `.agents/rules/source.rule.md` |',
    ].join('\n'))
    fs.writeFileSync(path.join(root, '.agents/rules/source.rule.md'), '# Source\n\nKeep the source boundary.\n')
    fs.writeFileSync(path.join(root, '.agents/rules/unrelated.rule.md'), '# Unrelated\n')

    const packet = createTaskContextPacket(root, { targetPaths: ['src/example.ts'] })

    expect(packet.files.map(file => file.path)).toEqual(['AGENTS.md', '.agents/rules/source.rule.md'])
    expect(renderTaskContextPacket(packet)).not.toContain('Unrelated')
  })

  it('reports routed files omitted by the byte budget', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'task-context-budget-'))
    roots.push(root)
    fs.mkdirSync(path.join(root, '.agents/rules'), { recursive: true })
    const rootAgents = [
      '# Root',
      '',
      '| path | read |',
      '|---|---|',
      '| `src/**` | `.agents/rules/source.rule.md` |',
    ].join('\n')
    fs.writeFileSync(path.join(root, 'AGENTS.md'), rootAgents)
    fs.writeFileSync(path.join(root, '.agents/rules/source.rule.md'), `# Source\n\n${'x'.repeat(100)}\n`)

    const packet = createTaskContextPacket(root, {
      maxBytes: Buffer.byteLength(rootAgents),
      targetPaths: ['src/example.ts'],
    })

    expect(packet.files.map(file => file.path)).toEqual(['AGENTS.md'])
    expect(packet.omitted).toEqual(['.agents/rules/source.rule.md'])
  })
})
