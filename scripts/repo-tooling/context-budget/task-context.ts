import type { TaskRouteClosureInput } from '../ai-friendliness-audit/types.ts'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import { calculateTaskRouteClosure } from '../ai-friendliness-audit/task-route-closure.ts'
import { buildTaskContextPacket, contextBudgetDefaults } from './context-budget.ts'

export type TaskContextPacketInput = TaskRouteClosureInput & {
  maxBytes?: number
}

export type TaskContextPacket = {
  closure: ReturnType<typeof calculateTaskRouteClosure>
  files: Array<{ content: string, path: string }>
  omitted: string[]
  totalBytes: number
}

export function createTaskContextPacket(rootDir: string, input: TaskContextPacketInput): TaskContextPacket {
  const resolvedRoot = fs.realpathSync(path.resolve(rootDir))
  const closure = calculateTaskRouteClosure(resolvedRoot, input)
  const packet = buildTaskContextPacket({
    files: closure.files.flatMap((file) => {
      const candidate = path.resolve(resolvedRoot, file.path)
      if (!fs.existsSync(candidate))
        return []
      const canonicalFile = fs.realpathSync(candidate)
      const relative = path.relative(resolvedRoot, canonicalFile)
      if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.statSync(canonicalFile).isFile())
        return []
      const content = fs.readFileSync(canonicalFile, 'utf8')
      return [{
        bytes: Buffer.byteLength(content),
        content,
        path: file.path,
        priority: file.depth,
      }]
    }),
    maxBytes: input.maxBytes ?? contextBudgetDefaults.maxPacketBytes,
  })

  return {
    closure,
    files: packet.files.map(file => ({ content: file.content, path: file.path })),
    omitted: packet.omitted,
    totalBytes: packet.totalBytes,
  }
}

export function renderTaskContextPacket(packet: TaskContextPacket): string {
  const sections = packet.files.map(file => `## ${file.path}\n\n${file.content.trim()}`)
  const omitted = packet.omitted.length > 0
    ? `\n\n## Omitted by byte budget\n\n${packet.omitted.map(file => `- ${file}`).join('\n')}`
    : ''
  return `# Task context packet\n\n${sections.join('\n\n')}${omitted}\n`
}
