import type {
  TaskRouteClosureCycle,
  TaskRouteClosureEdge,
  TaskRouteClosureFile,
  TaskRouteClosureInput,
  TaskRouteClosureMissingReference,
  TaskRouteClosureReport,
} from './types.ts'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'

const markdownLinkPattern = /\[[^\]]*\]\(([^)]+\.md(?:#[^)]*)?)\)/gu
const inlineMarkdownPathPattern = /`([^`\n]+\.md(?:#[^`\n]*)?)`/gu

export function calculateTaskRouteClosure(rootDir: string, input: TaskRouteClosureInput): TaskRouteClosureReport {
  const resolvedRootDir = fs.realpathSync(path.resolve(rootDir))
  const normalizedInput = normalizeTaskRouteClosureInput(resolvedRootDir, input)
  const files = new Map<string, TaskRouteClosureFile>()
  const edges: TaskRouteClosureEdge[] = []
  const missingReferences: TaskRouteClosureMissingReference[] = []
  const cycles: TaskRouteClosureCycle[] = []
  const seenEdges = new Set<string>()
  const seenCycles = new Set<string>()
  const traversedReferenceSources = new Set<string>()
  let maxDepth = 0

  const rootAgentsPath = resolveExistingFileInsideRoot(resolvedRootDir, path.join(resolvedRootDir, 'AGENTS.md'))
  if (!rootAgentsPath) {
    return {
      cycles: [],
      edges: [],
      files: [],
      input: normalizedInput,
      missingReferences: [],
      stats: {
        branchCount: 0,
        edgeCount: 0,
        maxBranchingFactor: 0,
        maxDepth: 0,
        uniqueBytes: 0,
        uniqueEstimatedTokens: 0,
      },
    }
  }

  const rootRelativePath = toPosix(path.relative(resolvedRootDir, rootAgentsPath))
  registerFile(rootAgentsPath, 'agents', 0, ['root-entry'])
  maxDepth = 0

  const rootContent = fs.readFileSync(rootAgentsPath, 'utf8')
  const pathRoutes = parsePathRoutes(rootContent)
  const intentRoutes = parseIntentRoutes(rootContent)

  const selectedSkillNames = dedupe([
    ...normalizedInput.skillNames,
    ...resolveSkillNames(intentRoutes, normalizedInput.intentNames),
  ])

  const referencedRulePaths = new Set<string>()
  for (const targetPath of normalizedInput.targetPaths) {
    for (const route of pathRoutes) {
      if (!route.patterns.some(pattern => matchesGlob(targetPath, pattern)))
        continue
      for (const reference of route.references) {
        const absolutePath = resolveExistingFileInsideRoot(resolvedRootDir, path.resolve(resolvedRootDir, reference))
        if (!absolutePath)
          continue
        referencedRulePaths.add(toPosix(path.relative(resolvedRootDir, absolutePath)))
        addEdge(rootRelativePath, toPosix(path.relative(resolvedRootDir, absolutePath)), 'path-route', route.line, route.patterns.join(', '))
        registerFile(absolutePath, classifyDocumentKind(absolutePath, resolvedRootDir), 1, [`path-route:${route.patterns.join(',')}`])
        traverseReferences(absolutePath, 1, [rootRelativePath, toPosix(path.relative(resolvedRootDir, absolutePath))])
      }
    }

    const scopedAgentsPath = findNearestScopedAgents(resolvedRootDir, targetPath)
    if (scopedAgentsPath) {
      const scopedRelativePath = toPosix(path.relative(resolvedRootDir, scopedAgentsPath))
      addEdge(rootRelativePath, scopedRelativePath, 'scoped-entry')
      registerFile(scopedAgentsPath, 'agents', 1, ['scoped-entry'])
      traverseReferences(scopedAgentsPath, 1, [rootRelativePath, scopedRelativePath])
    }
  }

  if (normalizedInput.requiresTestingRule) {
    const testingRulePath = resolveExistingFileInsideRoot(resolvedRootDir, path.join(resolvedRootDir, '.agents', 'rules', 'testing.rule.md'))
    if (testingRulePath) {
      const testingRuleRelativePath = toPosix(path.relative(resolvedRootDir, testingRulePath))
      if (!referencedRulePaths.has(testingRuleRelativePath)) {
        addEdge(rootRelativePath, testingRuleRelativePath, 'test-overlay')
        registerFile(testingRulePath, 'rule', 1, ['test-overlay'])
        traverseReferences(testingRulePath, 1, [rootRelativePath, testingRuleRelativePath])
      }
    }
  }

  for (const skillName of selectedSkillNames) {
    if (!/^[a-z0-9][a-z0-9-]*$/u.test(skillName))
      continue
    const skillPath = resolveExistingFileInsideRoot(resolvedRootDir, path.join(resolvedRootDir, '.agents', 'skills', skillName, 'SKILL.md'))
    if (!skillPath)
      continue
    const skillRelativePath = toPosix(path.relative(resolvedRootDir, skillPath))
    const edgeKind = normalizedInput.skillNames.includes(skillName) ? 'selected-skill' : 'intent-route'
    addEdge(rootRelativePath, skillRelativePath, edgeKind, undefined, skillName)
    registerFile(skillPath, 'skill', 1, [`${edgeKind}:${skillName}`])
    traverseReferences(skillPath, 1, [rootRelativePath, skillRelativePath])
  }

  const outgoingEdgeCounts = new Map<string, number>()
  for (const edge of edges)
    outgoingEdgeCounts.set(edge.from, (outgoingEdgeCounts.get(edge.from) ?? 0) + 1)

  const sortedFiles = [...files.values()].sort((left, right) => left.path.localeCompare(right.path))
  const uniqueBytes = sortedFiles.reduce((total, file) => total + file.bytes, 0)

  return {
    cycles: cycles.sort((left, right) => left.path.join('>').localeCompare(right.path.join('>'))),
    edges: edges.sort(compareEdges),
    files: sortedFiles,
    input: normalizedInput,
    missingReferences: missingReferences.sort(compareMissingReferences),
    stats: {
      branchCount: outgoingEdgeCounts.size,
      edgeCount: edges.length,
      maxBranchingFactor: Math.max(0, ...outgoingEdgeCounts.values()),
      maxDepth,
      uniqueBytes,
      uniqueEstimatedTokens: estimateTokens(uniqueBytes),
    },
  }

  function registerFile(absolutePath: string, kind: TaskRouteClosureFile['kind'], depth: number, reasons: string[]): void {
    const safePath = resolveExistingFileInsideRoot(resolvedRootDir, absolutePath)
    if (!safePath)
      return
    const relativePath = toPosix(path.relative(resolvedRootDir, safePath))
    const content = fs.readFileSync(safePath, 'utf8')
    const bytes = Buffer.byteLength(content)
    const existing = files.get(relativePath)
    if (!existing) {
      files.set(relativePath, {
        bytes,
        depth,
        estimatedTokens: estimateTokens(bytes),
        kind,
        path: relativePath,
        reasons: dedupe(reasons),
      })
    }
    else {
      existing.depth = Math.min(existing.depth, depth)
      existing.reasons = dedupe([...existing.reasons, ...reasons])
    }
    maxDepth = Math.max(maxDepth, depth)
  }

  function addEdge(from: string, to: string, kind: TaskRouteClosureEdge['kind'], line?: number, detail?: string): void {
    const key = [from, to, kind, String(line ?? ''), detail ?? ''].join('|')
    if (seenEdges.has(key))
      return
    seenEdges.add(key)
    edges.push({
      detail,
      from,
      kind,
      line,
      to,
    })
  }

  function traverseReferences(absolutePath: string, depth: number, stack: string[]): void {
    const safePath = resolveExistingFileInsideRoot(resolvedRootDir, absolutePath)
    if (!safePath)
      return
    const relativePath = toPosix(path.relative(resolvedRootDir, safePath))
    if (traversedReferenceSources.has(relativePath))
      return
    traversedReferenceSources.add(relativePath)

    const content = fs.readFileSync(safePath, 'utf8')
    const lines = content.split('\n')
    for (const [index, line] of lines.entries()) {
      for (const reference of extractMarkdownReferences(line)) {
        const resolvedReference = resolveMarkdownReference(resolvedRootDir, safePath, reference)
        if (!resolvedReference)
          continue
        if (!resolvedReference.exists) {
          missingReferences.push({
            from: relativePath,
            line: index + 1,
            reference,
            resolvedPath: resolvedReference.relativePath,
          })
          continue
        }

        addEdge(relativePath, resolvedReference.relativePath, 'markdown-reference', index + 1, reference)
        registerFile(resolvedReference.absolutePath, classifyDocumentKind(resolvedReference.absolutePath, resolvedRootDir), depth + 1, [`markdown-reference:${relativePath}`])

        const cycleStart = stack.indexOf(resolvedReference.relativePath)
        if (cycleStart !== -1) {
          const cyclePath = [...stack.slice(cycleStart), resolvedReference.relativePath]
          const cycleKey = cyclePath.join('>')
          if (!seenCycles.has(cycleKey)) {
            seenCycles.add(cycleKey)
            cycles.push({ path: cyclePath })
          }
          continue
        }

        traverseReferences(resolvedReference.absolutePath, depth + 1, [...stack, resolvedReference.relativePath])
      }
    }
  }
}

export function estimateTokens(bytes: number): number {
  return Math.ceil(bytes / 4)
}

function parsePathRoutes(content: string): Array<{ line: number, patterns: string[], references: string[] }> {
  return content
    .split('\n')
    .flatMap((line, index) => {
      if (!/^\s*\|.*\|\s*$/u.test(line))
        return []
      const cells = line.split('|').map(cell => cell.trim()).filter(Boolean)
      if (cells.length < 2)
        return []
      const patterns = extractBacktickTokens(cells[0]).filter(token => !token.endsWith('.md'))
      const references = extractBacktickTokens(cells[1]).filter(token => token.endsWith('.md'))
      if (patterns.length === 0 || references.length === 0)
        return []
      return [{ line: index + 1, patterns, references }]
    })
}

function parseIntentRoutes(content: string): Array<{ description: string, skillName: string }> {
  return content
    .split('\n')
    .flatMap((line) => {
      const routeStart = line.indexOf('- ')
      const separator = line.indexOf('：', routeStart + 2)
      if (routeStart < 0 || separator < 0)
        return []
      const description = line.slice(routeStart + 2, separator).trim()
      const skill = line.slice(separator + 1).match(/`([^`]+)`/u)?.[1]
      return description && skill
        ? [{ description, skillName: skill }]
        : []
    })
}

function resolveSkillNames(
  routes: Array<{ description: string, skillName: string }>,
  intentNames: readonly string[],
): readonly string[] {
  const normalizedIntents = intentNames.map(normalizeIntentName)
  return dedupe(routes.flatMap((route) => {
    const normalizedDescription = normalizeIntentName(route.description)
    const normalizedSkillName = normalizeIntentName(route.skillName)
    return normalizedIntents.some((intentName) => {
      if (!intentName)
        return false
      return intentName === normalizedSkillName
        || normalizedDescription.includes(intentName)
        || intentName.includes(normalizedDescription)
    })
      ? [route.skillName]
      : []
  }))
}

function normalizeTaskRouteClosureInput(rootDir: string, input: TaskRouteClosureInput): TaskRouteClosureReport['input'] {
  const targetPaths = dedupe(input.targetPaths.map(targetPath => normalizeTaskPath(rootDir, targetPath)).filter((value): value is string => Boolean(value)))
  const intentNames = dedupe((input.intentNames ?? []).map(value => value.trim()).filter(Boolean))
  const skillNames = dedupe((input.skillNames ?? []).map(value => value.trim()).filter(Boolean))
  const requiresTestingRule = targetPaths.some(isTestTargetPath) || input.testRisk === true || input.testRisk === 'required'

  return {
    intentNames,
    requiresTestingRule,
    skillNames,
    targetPaths,
    testRisk: requiresTestingRule ? 'required' : 'none',
  }
}

function findNearestScopedAgents(rootDir: string, targetPath: string): string | null {
  let currentDirectory = path.dirname(path.join(rootDir, targetPath))
  const resolvedRootDir = path.resolve(rootDir)
  while (currentDirectory.startsWith(resolvedRootDir) && currentDirectory !== resolvedRootDir) {
    const candidate = path.join(currentDirectory, 'AGENTS.md')
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile())
      return candidate
    currentDirectory = path.dirname(currentDirectory)
  }
  return null
}

function resolveExistingFileInsideRoot(rootDir: string, candidatePath: string): string | null {
  const resolvedRoot = path.resolve(rootDir)
  const resolvedCandidate = path.resolve(candidatePath)
  const lexicalRelative = path.relative(resolvedRoot, resolvedCandidate)
  if (lexicalRelative.startsWith('..') || path.isAbsolute(lexicalRelative) || !fs.existsSync(resolvedCandidate))
    return null

  try {
    const canonicalRoot = fs.realpathSync(resolvedRoot)
    const canonicalCandidate = fs.realpathSync(resolvedCandidate)
    const canonicalRelative = path.relative(canonicalRoot, canonicalCandidate)
    if (canonicalRelative.startsWith('..') || path.isAbsolute(canonicalRelative) || !fs.statSync(canonicalCandidate).isFile())
      return null
    return canonicalCandidate
  }
  catch {
    return null
  }
}

function resolveMarkdownReference(
  rootDir: string,
  sourceAbsolutePath: string,
  reference: string,
): { absolutePath: string, exists: boolean, relativePath: string } | null {
  const cleanReference = reference.split('#')[0]?.trim()
  if (!cleanReference || /^(?:https?:|mailto:|\/|~\/)/u.test(cleanReference) || /[*?{}]/u.test(cleanReference))
    return null

  const resolvedAbsolutePath = /^(?:\.agents|apps|packages)\//u.test(cleanReference)
    ? path.resolve(rootDir, cleanReference)
    : path.resolve(path.dirname(sourceAbsolutePath), cleanReference)
  const relativePath = toPosix(path.relative(rootDir, resolvedAbsolutePath))
  if (relativePath.startsWith('../') || path.isAbsolute(relativePath)) {
    return {
      absolutePath: resolvedAbsolutePath,
      exists: false,
      relativePath,
    }
  }

  let canonicalResolvedPath: string | null = null
  if (fs.existsSync(resolvedAbsolutePath)) {
    try {
      canonicalResolvedPath = fs.realpathSync(resolvedAbsolutePath)
    }
    catch {
      canonicalResolvedPath = null
    }
  }
  const canonicalRelativePath = canonicalResolvedPath ? toPosix(path.relative(fs.realpathSync(rootDir), canonicalResolvedPath)) : null
  const exists = canonicalResolvedPath !== null
    && canonicalRelativePath !== null
    && !canonicalRelativePath.startsWith('../')
    && !path.isAbsolute(canonicalRelativePath)
    && fs.statSync(canonicalResolvedPath).isFile()

  return {
    absolutePath: resolvedAbsolutePath,
    exists,
    relativePath,
  }
}

function extractMarkdownReferences(line: string): string[] {
  return dedupe([
    ...[...line.matchAll(markdownLinkPattern)].map(match => match[1] ?? ''),
    ...[...line.matchAll(inlineMarkdownPathPattern)].map(match => match[1] ?? ''),
  ].filter(Boolean))
}

function extractBacktickTokens(value: string): string[] {
  return [...value.matchAll(/`([^`]+)`/gu)].map(match => match[1] ?? '').filter(Boolean)
}

function classifyDocumentKind(absolutePath: string, rootDir: string): TaskRouteClosureFile['kind'] {
  const relativePath = toPosix(path.relative(rootDir, absolutePath))
  if (relativePath === 'AGENTS.md' || relativePath.endsWith('/AGENTS.md'))
    return 'agents'
  if (relativePath.endsWith('/SKILL.md'))
    return 'skill'
  if (/\.rule\.md$/u.test(relativePath))
    return 'rule'
  return 'reference'
}

function normalizeTaskPath(rootDir: string, targetPath: string): string | null {
  const resolvedTargetPath = path.isAbsolute(targetPath)
    ? path.resolve(targetPath)
    : path.resolve(rootDir, targetPath)
  const relativePath = toPosix(path.relative(rootDir, resolvedTargetPath))
  if (!relativePath || relativePath === '.')
    return null
  return relativePath.startsWith('../') || path.isAbsolute(relativePath) ? null : relativePath
}

function isTestTargetPath(targetPath: string): boolean {
  return /(?:^|\/)(?:__fixtures__|fixtures?)(?:\/|$)/u.test(targetPath)
    || /\.(?:spec|test)\.[cm]?[jt]sx?$/u.test(targetPath)
}

function normalizeIntentName(value: string): string {
  return value.replace(/[\s，。；：、,.!?！？:;"'“”‘’()[\]{}<>/\\-]/gu, '').toLowerCase()
}

function matchesGlob(value: string, pattern: string): boolean {
  return globToRegExp(pattern).test(value)
}

function globToRegExp(pattern: string): RegExp {
  let expression = '^'
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index]
    const next = pattern[index + 1]
    if (char === '*' && next === '*') {
      expression += '.*'
      index += 1
      continue
    }
    if (char === '*') {
      expression += '[^/]*'
      continue
    }
    expression += escapeRegExp(char)
  }
  expression += '$'
  return new RegExp(expression, 'u')
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/gu, '\\$&')
}

function compareEdges(left: TaskRouteClosureEdge, right: TaskRouteClosureEdge): number {
  return left.from.localeCompare(right.from)
    || left.to.localeCompare(right.to)
    || left.kind.localeCompare(right.kind)
    || (left.line ?? 0) - (right.line ?? 0)
    || (left.detail ?? '').localeCompare(right.detail ?? '')
}

function compareMissingReferences(left: TaskRouteClosureMissingReference, right: TaskRouteClosureMissingReference): number {
  return left.from.localeCompare(right.from)
    || left.line - right.line
    || left.reference.localeCompare(right.reference)
}

function dedupe<T>(values: readonly T[]): T[] {
  return [...new Set(values)]
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/')
}
