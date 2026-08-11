import { Buffer } from 'node:buffer'
import path from 'node:path'

export type ContextPacketFile = {
  bytes: number
  content: string
  path: string
  priority: number
}

export type ContextPacket = {
  files: ContextPacketFile[]
  omitted: string[]
  totalBytes: number
}

export type DiscoveryBudgetOptions = {
  hardLimit: number
  warningAt: number
}

export type DiscoveryBudget = DiscoveryBudgetOptions & {
  count: number
  seen: Set<string>
  warned: boolean
}

export type DiscoveryCall = {
  key: string
  kind: 'read' | 'search'
}

export type DiscoveryDecision = {
  count: number
  decision: 'allow' | 'block_budget' | 'block_duplicate' | 'warn'
  remaining: number
}

export const contextBudgetDefaults = {
  discoveryHardLimit: 32,
  discoveryWarningAt: 24,
  maxPacketBytes: 24 * 1024,
  maxReadLines: 200,
  maxToolResultBytes: 16 * 1024,
  maxToolResultLines: 400,
} as const

export function buildTaskContextPacket(options: { files: ContextPacketFile[], maxBytes: number }): ContextPacket {
  const sorted = [...options.files].sort((left, right) => left.priority - right.priority || left.path.localeCompare(right.path))
  const files: ContextPacketFile[] = []
  const omitted: string[] = []
  const seen = new Set<string>()
  let totalBytes = 0

  for (const file of sorted) {
    if (seen.has(file.path))
      continue
    seen.add(file.path)
    const bytes = Buffer.byteLength(file.content)
    if (totalBytes + bytes > options.maxBytes) {
      omitted.push(file.path)
      continue
    }
    files.push({ ...file, bytes })
    totalBytes += bytes
  }

  return { files, omitted, totalBytes }
}

export function applyReadDefaults(
  input: { limit?: number, offset?: number, path: string },
  options: { maxReadLines: number },
): { limit: number, offset: number, path: string } {
  return {
    limit: Math.min(input.limit ?? options.maxReadLines, options.maxReadLines),
    offset: input.offset ?? 1,
    path: input.path,
  }
}

export function createDiscoveryBudget(options: DiscoveryBudgetOptions): DiscoveryBudget {
  if (options.warningAt < 1 || options.hardLimit < options.warningAt)
    throw new Error('INVALID_DISCOVERY_BUDGET')
  return { ...options, count: 0, seen: new Set(), warned: false }
}

export function evaluateDiscoveryCall(budget: DiscoveryBudget, call: DiscoveryCall): DiscoveryDecision {
  if (budget.seen.has(call.key)) {
    return {
      count: budget.count,
      decision: 'block_duplicate',
      remaining: Math.max(0, budget.hardLimit - budget.count),
    }
  }
  if (budget.count >= budget.hardLimit) {
    return { count: budget.count, decision: 'block_budget', remaining: 0 }
  }

  budget.seen.add(call.key)
  budget.count += 1
  const shouldWarn = !budget.warned && budget.count >= budget.warningAt
  if (shouldWarn)
    budget.warned = true
  return {
    count: budget.count,
    decision: shouldWarn ? 'warn' : 'allow',
    remaining: Math.max(0, budget.hardLimit - budget.count),
  }
}

export function normalizeProjectPath(rootDir: string, inputPath: string): string {
  return path.relative(path.resolve(rootDir), path.resolve(rootDir, inputPath)).replaceAll(path.sep, '/') || '.'
}

export function isDiscoveryShellCommand(command: string): boolean {
  if (/[;|<>`]/u.test(command) || command.includes('$(') || command.replaceAll('&&', '').includes('&'))
    return false
  const segments = command
    .split(/&&|\n/u)
    .map(segment => segment.trim())
    .filter(Boolean)
  if (segments.length === 0)
    return false

  return segments.every((segment) => {
    const tokens = segment.split(/\s+/u)
    if (tokens[0] === 'env')
      tokens.shift()
    while (tokens[0]?.includes('='))
      tokens.shift()
    const [commandName = '', ...args] = tokens
    if (!['rg', 'grep', 'find', 'fd', 'ls', 'tree', 'cat', 'head', 'tail', 'nl'].includes(commandName))
      return false
    if (commandName === 'find' && args.some(argument => ['-delete', '-exec', '-execdir', '-fls', '-fprint', '-fprint0', '-fprintf', '-ok', '-okdir'].includes(argument)))
      return false
    return true
  })
}

export function truncateToolText(
  text: string,
  options: { maxBytes: number, maxLines: number },
): { content: string, outputBytes: number, outputLines: number, totalBytes: number, totalLines: number, truncated: boolean } {
  const totalBytes = Buffer.byteLength(text)
  const lines = text.split('\n')
  if (totalBytes <= options.maxBytes && lines.length <= options.maxLines) {
    return {
      content: text,
      outputBytes: totalBytes,
      outputLines: lines.length,
      totalBytes,
      totalLines: lines.length,
      truncated: false,
    }
  }
  const maxKeptLines = Math.min(lines.length, Math.max(0, options.maxLines - 1))
  const headCount = Math.ceil(maxKeptLines / 2)
  const tailCount = Math.floor(maxKeptLines / 2)
  const headSource = lines.slice(0, headCount).join('\n')
  const tailSource = tailCount > 0 ? lines.slice(-tailCount).join('\n') : ''
  const omittedLines = Math.max(0, lines.length - maxKeptLines)
  const marker = `[Context budget: ${omittedLines} lines omitted, output shortened from ${totalBytes} bytes. Narrow the query or request a specific continuation range.]`
  const separatorCount = (headSource ? 1 : 0) + (tailSource ? 1 : 0)
  const availableBytes = Math.max(0, options.maxBytes - Buffer.byteLength(marker) - separatorCount)
  const headBudget = Math.ceil(availableBytes / 2)
  const tailBudget = Math.floor(availableBytes / 2)
  const head = truncateUtf8Prefix(headSource, headBudget)
  const tail = truncateUtf8Suffix(tailSource, tailBudget)
  const content = [head, marker, tail].filter(Boolean).join('\n')

  return {
    content,
    outputBytes: Buffer.byteLength(content),
    outputLines: content.split('\n').length,
    totalBytes,
    totalLines: lines.length,
    truncated: true,
  }
}

function truncateUtf8Prefix(value: string, maxBytes: number): string {
  let output = ''
  let bytes = 0
  for (const character of value) {
    const characterBytes = Buffer.byteLength(character)
    if (bytes + characterBytes > maxBytes)
      break
    output += character
    bytes += characterBytes
  }
  return output
}

function truncateUtf8Suffix(value: string, maxBytes: number): string {
  let output = ''
  let bytes = 0
  for (const character of Array.from(value).reverse()) {
    const characterBytes = Buffer.byteLength(character)
    if (bytes + characterBytes > maxBytes)
      break
    output = character + output
    bytes += characterBytes
  }
  return output
}
