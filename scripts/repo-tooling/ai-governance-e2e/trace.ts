import type { GovernanceProfile } from './profiles.ts'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'

export const logSchemaVersion = 'maestro-cli-history/1'

type JsonRecord = Record<string, unknown>

export type GovernanceRead = {
  bytes: number
  path: string
  tokens: number
}

export type GovernanceTrace = {
  errors: string[]
  governanceTokens: number
  observationLimitations: string[]
  rawLogPath: string
  rawReadCount: number
  readTrace: GovernanceRead[]
  requiredReadCoverage: number
  requiredReadGroups: Array<{ hits: string[], id: string, required: string[], satisfied: boolean, weight: number }>
  requiredReadsHit: string[]
  requiredReadsMissing: string[]
  status: 'infrastructure_error' | 'ok'
  uniqueReadCount: number
  unrelatedCategoryReads: string[]
}

export type ParseGovernanceTraceOptions = {
  rawLogPath: string
  readFile?: (file: string) => string
  rootDir: string
}

const KNOWN_ENTRY_TYPES = new Set([
  'assistant_message',
  'command_exec',
  'status_change',
  'thinking',
  'token_usage',
  'tool_use',
])

const READ_COMMAND_PATTERN = /\b(?:cat|head|less|nl|sed|tail)\b/u
const GOVERNANCE_TOKEN_PATTERN = /[^\s"'`;|&()]+/gu

export function parseGovernanceTrace(
  rawLog: string,
  profile: GovernanceProfile,
  options: ParseGovernanceTraceOptions,
): GovernanceTrace {
  const errors: string[] = []
  const entries = parseEntries(rawLog, errors)
  const commandEntries = entries.filter(entry => entry.type === 'command_exec')

  if (commandEntries.length === 0)
    errors.push('missing_command_exec_trace')

  const readPaths: string[] = []
  for (const entry of commandEntries) {
    if (entry.exitCode !== 0 || typeof entry.command !== 'string' || !READ_COMMAND_PATTERN.test(entry.command))
      continue
    for (const candidate of extractGovernancePaths(entry.command, options.rootDir))
      readPaths.push(candidate)
  }

  const uniqueReadPaths = [...new Set(readPaths)]
  const readTrace: GovernanceRead[] = []
  for (const relativePath of uniqueReadPaths.sort()) {
    const absolutePath = path.resolve(options.rootDir, relativePath)
    try {
      if (!options.readFile && !fs.statSync(absolutePath).isFile())
        continue
      const content = options.readFile ? options.readFile(absolutePath) : fs.readFileSync(absolutePath, 'utf8')
      const bytes = Buffer.byteLength(content, 'utf8')
      readTrace.push({ bytes, path: relativePath, tokens: Math.ceil(bytes / 4) })
    }
    catch {
      // 存在性探测和目录搜索属于命令证据，不计为具体文件读取证据。
    }
  }

  const requiredReadGroups = [
    { id: 'entries', required: profile.expectedAgentEntries.map(entry => `entry:${entry}`), weight: profile.expectedAgentEntries.length === 0 ? 0 : 1 },
    { id: 'rules', required: profile.expectedRules.map(rule => `rule:${rule}`), weight: profile.expectedRules.length === 0 ? 0 : 1 },
    { id: 'skills', required: profile.expectedSkills.map(skill => `skill:${skill}`), weight: profile.expectedSkills.length === 0 ? 0 : 1 },
  ].map((group) => {
    const hits = group.required.filter(required => isRequiredReadHit(required, readTrace))
    return {
      hits,
      id: group.id,
      required: group.required,
      satisfied: group.required.length === 0 || hits.length === group.required.length,
      weight: group.weight,
    }
  })
  const requiredReads = requiredReadGroups.flatMap(group => group.required)
  const requiredReadsHit = requiredReadGroups.flatMap(group => group.hits)
  const requiredReadsMissing = requiredReads.filter(required => !requiredReadsHit.includes(required))
  const weightedGroups = requiredReadGroups.filter(group => group.weight > 0)
  const requiredReadCoverage = weightedGroups.length === 0
    ? 1
    : weightedGroups.reduce((total, group) => total + (group.satisfied ? group.weight : 0), 0) / weightedGroups.reduce((total, group) => total + group.weight, 0)
  const unrelatedCategoryReads = profile.forbiddenCategories.filter(category => (
    readTrace.some(read => read.path.includes(`.agents/skills/${category}/`))
  ))

  return {
    errors,
    governanceTokens: readTrace.reduce((total, read) => total + read.tokens, 0),
    observationLimitations: ['content_read_shell_commands_only', 'model_attention_not_observable'],
    rawLogPath: options.rawLogPath,
    rawReadCount: readPaths.length,
    readTrace,
    requiredReadCoverage,
    requiredReadGroups,
    requiredReadsHit,
    requiredReadsMissing,
    status: errors.length === 0 ? 'ok' : 'infrastructure_error',
    uniqueReadCount: readTrace.length,
    unrelatedCategoryReads,
  }
}

function parseEntries(rawLog: string, errors: string[]): JsonRecord[] {
  if (rawLog.trim().length === 0) {
    errors.push('missing_raw_log')
    return []
  }

  const entries: JsonRecord[] = []
  for (const [index, line] of rawLog.split(/\r?\n/u).entries()) {
    if (line.trim().length === 0)
      continue
    try {
      const value = JSON.parse(line) as unknown
      if (!isRecord(value) || typeof value.type !== 'string') {
        errors.push(`invalid_entry_shape:${index + 1}`)
        continue
      }
      if (!KNOWN_ENTRY_TYPES.has(value.type))
        continue
      if (!hasValidEntryShape(value)) {
        errors.push(`invalid_${value.type}_shape:${index + 1}`)
        continue
      }
      entries.push(value)
    }
    catch {
      errors.push(`malformed_jsonl:${index + 1}`)
    }
  }
  return entries
}

function hasValidEntryShape(entry: JsonRecord): boolean {
  if (typeof entry.id !== 'string' || typeof entry.processId !== 'string' || typeof entry.timestamp !== 'string')
    return false

  switch (entry.type) {
    case 'assistant_message':
      return typeof entry.content === 'string' && typeof entry.partial === 'boolean'
    case 'command_exec':
      return typeof entry.command === 'string' && typeof entry.exitCode === 'number' && typeof entry.output === 'string'
    case 'status_change':
      return typeof entry.status === 'string' && typeof entry.reason === 'string'
    case 'thinking':
      return typeof entry.content === 'string'
    case 'token_usage':
      return typeof entry.inputTokens === 'number' && typeof entry.outputTokens === 'number'
    case 'tool_use':
      return typeof entry.name === 'string'
        && isRecord(entry.input)
        && typeof entry.status === 'string'
        && typeof entry.result === 'string'
    default:
      return false
  }
}

function extractGovernancePaths(command: string, rootDir: string): string[] {
  const paths: string[] = []
  const canonicalRoot = canonicalizePath(rootDir)
  for (const tokenMatch of command.matchAll(GOVERNANCE_TOKEN_PATTERN)) {
    const token = tokenMatch[0]?.replace(/^["'=]+|[,:"']+$/gu, '')
    if (!token || (path.posix.basename(token) !== 'AGENTS.md' && !token.includes('.agents/')))
      continue
    const rawPath = token
    const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rootDir, rawPath)
    const relativePath = normalizePath(path.relative(canonicalRoot, canonicalizePath(absolutePath)))
    if (relativePath.startsWith('../') || path.isAbsolute(relativePath))
      continue
    if (relativePath === 'AGENTS.md' || relativePath.endsWith('/AGENTS.md') || relativePath.startsWith('.agents/'))
      paths.push(relativePath)
  }
  return paths
}

function canonicalizePath(value: string): string {
  const resolved = path.resolve(value)
  try {
    return fs.realpathSync.native(resolved)
  }
  catch {
    return resolved.replace(/^\/private\/(?=(?:tmp|var)(?:\/|$))/u, '/')
  }
}

function isRequiredReadHit(required: string, reads: GovernanceRead[]): boolean {
  const [kind, name] = required.split(':', 2)
  if (!name)
    return false
  if (kind === 'entry')
    return reads.some(read => read.path === name)
  if (kind === 'rule')
    return reads.some(read => read.path === `.agents/rules/${name}`)
  return reads.some(read => read.path === `.agents/skills/${name}/SKILL.md`)
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizePath(value: string): string {
  return value.split(path.sep).join('/')
}
