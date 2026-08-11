import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('context budget extension wiring', () => {
  it('keeps the project extension connected to the tested context-budget core', () => {
    const extension = fs.readFileSync(path.resolve('.pi/extensions/context-budget.ts'), 'utf8')

    expect(extension).toContain(`from '../../scripts/repo-tooling/context-budget/context-budget.ts'`)
    expect(extension).toContain(`from '../../scripts/repo-tooling/context-budget/task-context.ts'`)
    expect(extension).toContain(`pi.on('tool_call'`)
    expect(extension).toContain(`pi.on('tool_result'`)
    expect(extension).toContain(`name: 'task_context'`)
    expect(extension).not.toContain('packetFiles')
    expect(extension.match(/event\.toolName === 'edit'/gu)).toHaveLength(2)
    expect(extension.match(/event\.toolName === 'write'/gu)).toHaveLength(2)
    expect(extension).toContain(`event.toolName === 'bash'`)
    expect(extension).toContain(`if (!result.truncated && !warning)`)
    expect(extension).toContain('combinedText')
  })
})
