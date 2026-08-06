import fs from 'node:fs'
import path from 'node:path'

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'])
const TYPE_SCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts'])
const IGNORED_DIRECTORIES = new Set(['.git', '.next', '.turbo', '.workflow', 'coverage', 'dist', 'node_modules', '__fixtures__'])
const GOVERNED_TASKS = ['build', 'lint', 'typecheck', 'test:run'] as const
const REQUIRED_TURBO_TASKS = ['build', 'typecheck', 'test:run'] as const

export type WorkspaceTaskName = typeof GOVERNED_TASKS[number]

export type WorkspaceValidationCode
  = | 'DANGLING_TEST_OWNER'
    | 'INVALID_PACKAGE_STRUCTURE'
    | 'INVALID_TEST_RUNNER'
    | 'MISSING_REQUIRED_TASK'
    | 'OMITTED_TEST_OWNER'
    | 'STALE_WORKSPACE_MANIFEST'

export type WorkspaceValidationIssue = {
  code: WorkspaceValidationCode
  workspace: string
  task?: WorkspaceTaskName
}

export type WorkspaceTaskObservation = {
  manifestTasks: string[]
  name: string
  notApplicableTasks: WorkspaceTaskName[]
  path: string
  requiredTasks: WorkspaceTaskName[]
  testSources: string[]
}

export type WorkspaceValidationResult = {
  danglingTestOwners: WorkspaceValidationIssue[]
  missingRequiredTasks: WorkspaceValidationIssue[]
  observedWorkspaceCount: number
  omittedTestOwners: WorkspaceValidationIssue[]
  staleWorkspaces: WorkspaceValidationIssue[]
  workspaces: WorkspaceTaskObservation[]
}

type WorkspaceManifest = {
  exports?: unknown
  name?: unknown
  scripts?: unknown
}

export function validateWorkspaceGovernance(rootDir: string): WorkspaceValidationResult {
  const workspaceConfigPath = path.join(rootDir, 'pnpm-workspace.yaml')
  const rootManifestPath = path.join(rootDir, 'package.json')
  const turboConfigPath = path.join(rootDir, 'turbo.json')

  if (!fs.existsSync(workspaceConfigPath))
    throw new Error('WORKSPACE_CONFIG_MISSING: pnpm-workspace.yaml was not found')
  if (!fs.existsSync(rootManifestPath))
    throw new Error('ROOT_MANIFEST_MISSING: package.json was not found')
  if (!fs.existsSync(turboConfigPath))
    throw new Error('TURBO_CONFIG_MISSING: turbo.json was not found')

  const patterns = parseWorkspacePatterns(fs.readFileSync(workspaceConfigPath, 'utf8'))
  const discovered = discoverWorkspaceCandidates(rootDir, patterns)
  const staleWorkspaces = discovered.stalePaths.map(workspace => ({
    code: 'STALE_WORKSPACE_MANIFEST' as const,
    workspace,
  }))

  const rootManifest = readJson<WorkspaceManifest>(rootManifestPath)
  const turboConfig = readJson<{ tasks?: unknown }>(turboConfigPath)
  const rootScripts = readScripts(rootManifest)
  const turboTasks = isRecord(turboConfig.tasks) ? turboConfig.tasks : {}
  const missingRequiredTasks: WorkspaceValidationIssue[] = []

  for (const task of REQUIRED_TURBO_TASKS) {
    if (!isRecord(turboTasks[task])) {
      missingRequiredTasks.push({ code: 'MISSING_REQUIRED_TASK', workspace: '<turbo>', task })
    }
  }
  for (const task of GOVERNED_TASKS) {
    const command = rootScripts[task]
    const hasOwner = task === 'lint'
      ? typeof command === 'string' && command.length > 0
      : typeof command === 'string' && command.includes(`turbo run ${task}`)
    if (!hasOwner)
      missingRequiredTasks.push({ code: 'MISSING_REQUIRED_TASK', workspace: '<root>', task })
  }

  const danglingTestOwners: WorkspaceValidationIssue[] = []
  const omittedTestOwners: WorkspaceValidationIssue[] = []
  const workspaces = discovered.manifestPaths.map((workspacePath) => {
    const manifest = readJson<WorkspaceManifest>(path.join(rootDir, workspacePath, 'package.json'))
    if (typeof manifest.name !== 'string' || manifest.name.length === 0)
      throw new Error(`INVALID_WORKSPACE_MANIFEST: ${workspacePath}/package.json has no non-empty name`)

    const scripts = readScripts(manifest)
    const sourceFiles = collectSourceFiles(path.join(rootDir, workspacePath), rootDir)
    if (workspacePath.startsWith('packages/')) {
      for (const requiredFile of ['README.md', 'tsconfig.json']) {
        if (!fs.existsSync(path.join(rootDir, workspacePath, requiredFile)))
          missingRequiredTasks.push({ code: 'INVALID_PACKAGE_STRUCTURE', workspace: workspacePath })
      }
      if (!isRecord(manifest.exports) || Object.keys(manifest.exports).length === 0)
        missingRequiredTasks.push({ code: 'INVALID_PACKAGE_STRUCTURE', workspace: workspacePath })
    }
    const testSources = sourceFiles.filter(isTestSource)
    const requiredTasks = requiredTasksFor(workspacePath, sourceFiles, testSources)
    const notApplicableTasks = GOVERNED_TASKS.filter(task => !requiredTasks.includes(task))

    for (const task of requiredTasks) {
      if (task === 'lint' || task === 'test:run')
        continue
      if (typeof scripts[task] !== 'string' || scripts[task].length === 0) {
        missingRequiredTasks.push({
          code: 'MISSING_REQUIRED_TASK',
          workspace: workspacePath,
          task,
        })
      }
    }

    const testCommand = scripts['test:run']
    const ownsTestTask = typeof testCommand === 'string' && testCommand.length > 0
    if (ownsTestTask && /passWithNoTests|pass-with-no-tests|\becho\s+(?:pass|ok)\b/iu.test(testCommand)) {
      missingRequiredTasks.push({ code: 'INVALID_TEST_RUNNER', workspace: workspacePath, task: 'test:run' })
    }
    if (ownsTestTask && testSources.length === 0) {
      danglingTestOwners.push({
        code: 'DANGLING_TEST_OWNER',
        workspace: workspacePath,
        task: 'test:run',
      })
    }
    if (!ownsTestTask && testSources.length > 0) {
      omittedTestOwners.push({
        code: 'OMITTED_TEST_OWNER',
        workspace: workspacePath,
        task: 'test:run',
      })
    }

    return {
      manifestTasks: Object.keys(scripts).sort(),
      name: manifest.name,
      notApplicableTasks,
      path: workspacePath,
      requiredTasks,
      testSources,
    }
  })

  return {
    danglingTestOwners,
    missingRequiredTasks,
    observedWorkspaceCount: workspaces.length,
    omittedTestOwners,
    staleWorkspaces,
    workspaces,
  }
}

export function workspaceValidationIssues(result: WorkspaceValidationResult): WorkspaceValidationIssue[] {
  return [
    ...result.missingRequiredTasks,
    ...result.staleWorkspaces,
    ...result.danglingTestOwners,
    ...result.omittedTestOwners,
  ]
}

function requiredTasksFor(
  workspacePath: string,
  sourceFiles: string[],
  testSources: string[],
): WorkspaceTaskName[] {
  const required = new Set<WorkspaceTaskName>()
  if (sourceFiles.length > 0)
    required.add('lint')
  if (sourceFiles.some(file => TYPE_SCRIPT_EXTENSIONS.has(path.extname(file))))
    required.add('typecheck')
  if (testSources.length > 0)
    required.add('test:run')
  if (workspacePath.startsWith('apps/'))
    required.add('build')
  return GOVERNED_TASKS.filter(task => required.has(task))
}

function parseWorkspacePatterns(source: string): string[] {
  const patterns: string[] = []
  let inPackages = false
  for (const line of source.split(/\r?\n/u)) {
    if (/^packages:\s*$/u.test(line)) {
      inPackages = true
      continue
    }
    if (!inPackages)
      continue
    if (/^[^\s#][^:]*:/u.test(line))
      break
    const trimmedLine = line.trimStart()
    if (!/^-\s/u.test(trimmedLine))
      continue
    const value = trimmedLine.slice(1).replace(/\s+#.*$/u, '').trim().replace(/^(['"])(.*)\1$/u, '$2')
    if (value)
      patterns.push(value)
  }
  if (patterns.length === 0)
    throw new Error('WORKSPACE_PATTERNS_MISSING: packages must contain at least one pattern')
  return patterns
}

function discoverWorkspaceCandidates(rootDir: string, patterns: string[]): {
  manifestPaths: string[]
  stalePaths: string[]
} {
  const included = new Set<string>()
  const stale = new Set<string>()

  for (const rawPattern of patterns) {
    const excluded = rawPattern.startsWith('!')
    const pattern = excluded ? rawPattern.slice(1) : rawPattern
    const candidates = expandWorkspacePattern(rootDir, pattern)

    if (!excluded && candidates.length === 0 && !pattern.includes('*'))
      stale.add(normalizePath(pattern))

    for (const candidate of candidates) {
      if (excluded) {
        included.delete(candidate)
        stale.delete(candidate)
      }
      else if (fs.existsSync(path.join(rootDir, candidate, 'package.json'))) {
        included.add(candidate)
      }
      else if (!pattern.includes('*')) {
        stale.add(candidate)
      }
    }
  }

  return {
    manifestPaths: [...included].sort(),
    stalePaths: [...stale].sort(),
  }
}

function expandWorkspacePattern(rootDir: string, pattern: string): string[] {
  if (path.isAbsolute(pattern) || pattern.includes('..') || /[?{}[\]]/u.test(pattern))
    throw new Error(`UNSUPPORTED_WORKSPACE_PATTERN: ${pattern}`)

  const segments = pattern.split('/').filter(Boolean)
  let candidates = ['']
  for (const segment of segments) {
    const next: string[] = []
    for (const candidate of candidates) {
      const directory = path.join(rootDir, candidate)
      if (segment === '*') {
        if (!fs.existsSync(directory))
          continue
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
          if (entry.isDirectory())
            next.push(path.join(candidate, entry.name))
        }
      }
      else {
        const target = path.join(candidate, segment)
        if (fs.existsSync(path.join(rootDir, target)))
          next.push(target)
      }
    }
    candidates = next
  }
  return candidates.map(normalizePath)
}

function collectSourceFiles(directory: string, rootDir: string): string[] {
  const files: string[] = []
  walk(directory, (file) => {
    if (SOURCE_EXTENSIONS.has(path.extname(file)) && path.basename(file) !== 'next-env.d.ts')
      files.push(normalizePath(path.relative(rootDir, file)))
  })
  return files.sort()
}

function walk(directory: string, visit: (file: string) => void): void {
  if (!fs.existsSync(directory))
    return
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name))
        walk(path.join(directory, entry.name), visit)
      continue
    }
    if (entry.isFile())
      visit(path.join(directory, entry.name))
  }
}

function isTestSource(file: string): boolean {
  return /(?:^|\/)__tests__\/|\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(file)
}

function readScripts(manifest: WorkspaceManifest): Record<string, string> {
  if (!isRecord(manifest.scripts))
    return {}
  return Object.fromEntries(
    Object.entries(manifest.scripts).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function readJson<T>(file: string): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  }
  catch (error) {
    throw new Error(`INVALID_JSON: ${file}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizePath(value: string): string {
  return value.split(path.sep).join('/').replace(/\/$/u, '')
}
