import type { GovernanceProfile } from './profiles.ts'
import type { GovernanceTrace } from './trace.ts'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { profiles } from './profiles.ts'
import { logSchemaVersion, parseGovernanceTrace } from './trace.ts'

type EndpointSnapshot = {
  configVersion: string | null
  enabled: boolean
  model: string | null
  tags: string[]
  tool: 'codex'
  type: string | null
}

type PreparedCommand = {
  command: string
  executionId: string
  mode: 'write'
  profileId: string
  runInBackground: true
  tool: 'codex'
  worktree: string
}

export type RunManifest = {
  artifactDir: string
  commands: PreparedCommand[]
  endpointSnapshot: EndpointSnapshot
  mainWorktreeDiffBefore: string[]
  ownedWorktrees: string[]
  rootDir: string
  runId: string
  sourceHead: string
  worktreeRoot: string
}

export type GateResult = {
  command: string
  exitCode: number | null
  kind: 'command' | 'static'
  passed: boolean
}

export type ProfileReport = {
  budget: number
  cleanup: { owned: boolean, status: 'pending' | 'removed' }
  commands: { delegate: string, gates: GateResult[] }
  diff_files: string[]
  endpoint_snapshot: EndpointSnapshot
  execution_id: string
  governance_tokens: number
  log_schema_version: string
  main_worktree_diff_before: string[]
  mode: 'write'
  profile: string
  raw_log_path: string
  read_trace: GovernanceTrace['readTrace']
  required_read_coverage: number
  run_id: string
  source_head: string
  trace_errors: string[]
  unrelated_category_reads: string[]
  verdict: 'failed' | 'infrastructure_error' | 'passed'
  worktree: string
}

export type RunReport = {
  generated_at: string
  profiles: ProfileReport[]
  run_id: string
  source_head: string
}

export type ValidationResult = {
  issues: string[]
  valid: boolean
}

export type PrepareRunOptions = {
  artifactRoot?: string
  cliToolsPath?: string
  rootDir?: string
  runId?: string
  worktreeRoot?: string
}

export type CollectRunOptions = {
  artifactDir: string
  historyDir?: string
}

export function prepareRun(options: PrepareRunOptions = {}): RunManifest {
  assertNode24()
  const rootDir = path.resolve(options.rootDir ?? process.cwd())
  const mainWorktreeDiffBefore = gitLines(rootDir, ['status', '--porcelain=v1', '--untracked-files=all'])
  if (mainWorktreeDiffBefore.length > 0)
    throw new Error(`DIRTY_SOURCE: ${mainWorktreeDiffBefore.join(', ')}`)

  const sourceHead = gitText(rootDir, ['rev-parse', 'HEAD'])
  const runId = options.runId ?? createRunId()
  const artifactRoot = path.resolve(options.artifactRoot ?? path.join(rootDir, '.workflow', 'ai-governance-e2e'))
  const artifactDir = path.join(artifactRoot, runId)
  const worktreeRoot = path.resolve(options.worktreeRoot ?? path.join(os.tmpdir(), 'kkfive-ai-governance-e2e', runId))
  const cliToolsPath = path.resolve(options.cliToolsPath ?? path.join(os.homedir(), '.maestro', 'cli-tools.json'))

  if (fs.existsSync(artifactDir) || fs.existsSync(worktreeRoot))
    throw new Error(`RUN_ALREADY_EXISTS: ${runId}`)

  const endpointSnapshot = loadCodexEndpointSnapshot(cliToolsPath)
  fs.mkdirSync(artifactDir, { recursive: true })
  fs.mkdirSync(worktreeRoot, { recursive: true })

  const ownedWorktrees: string[] = []
  try {
    const commands = profiles.map((profile) => {
      const worktree = path.join(worktreeRoot, profile.id)
      runGit(rootDir, ['worktree', 'add', '--detach', worktree, sourceHead])
      ownedWorktrees.push(worktree)
      const executionId = `cdx-ai-gov-${runId}-${profile.id}`
      return {
        command: `maestro delegate ${shellQuote(profile.prompt)} --to codex --mode write --id ${executionId} --cd ${shellQuote(worktree)}`,
        executionId,
        mode: 'write' as const,
        profileId: profile.id,
        runInBackground: true as const,
        tool: 'codex' as const,
        worktree,
      }
    })

    const manifest: RunManifest = {
      artifactDir,
      commands,
      endpointSnapshot,
      mainWorktreeDiffBefore,
      ownedWorktrees,
      rootDir,
      runId,
      sourceHead,
      worktreeRoot,
    }
    writeJson(path.join(artifactDir, 'commands.json'), commands)
    writeJson(path.join(artifactDir, 'manifest.json'), manifest)
    return manifest
  }
  catch (error) {
    for (const worktree of ownedWorktrees.reverse())
      removeOwnedWorktree(rootDir, worktreeRoot, worktree)
    fs.rmSync(worktreeRoot, { force: true, recursive: true })
    fs.rmSync(artifactDir, { force: true, recursive: true })
    throw error
  }
}

export function collectRun(options: CollectRunOptions): RunReport {
  const artifactDir = path.resolve(options.artifactDir)
  const manifest = readJson<RunManifest>(path.join(artifactDir, 'manifest.json'))
  const historyDir = path.resolve(options.historyDir ?? path.join(os.homedir(), '.maestro', 'cli-history'))
  const profileMap = new Map<string, GovernanceProfile>(profiles.map(profile => [profile.id, profile]))

  const profileReports = manifest.commands.map((prepared): ProfileReport => {
    const profile = profileMap.get(prepared.profileId)
    if (!profile)
      throw new Error(`UNKNOWN_PROFILE: ${prepared.profileId}`)
    const rawLogPath = path.join(historyDir, `${prepared.executionId}.jsonl`)
    const rawLog = fs.existsSync(rawLogPath) ? fs.readFileSync(rawLogPath, 'utf8') : ''
    const trace = parseGovernanceTrace(rawLog, profile, {
      rawLogPath,
      rootDir: prepared.worktree,
    })
    const diffFiles = collectChangedFiles(prepared.worktree)
    const gateResults = profile.gates.map(gate => runGate(gate, prepared.worktree))
    const hasUnexpectedDiff = diffFiles.some(file => !profile.allowedPaths.some(pattern => matchesAllowedPath(file, pattern)))
    const failedOracle = trace.requiredReadCoverage < profile.requiredHitRate
      || trace.unrelatedCategoryReads.length > profile.maxForbiddenCategoryHits
      || trace.governanceTokens > profile.budgetTokens
      || hasUnexpectedDiff
      || gateResults.some(gate => !gate.passed)
    const verdict = trace.status === 'infrastructure_error'
      ? 'infrastructure_error'
      : failedOracle ? 'failed' : 'passed'

    return {
      budget: profile.budgetTokens,
      cleanup: { owned: isOwnedPath(manifest.worktreeRoot, prepared.worktree), status: 'pending' },
      commands: { delegate: prepared.command, gates: gateResults },
      diff_files: diffFiles,
      endpoint_snapshot: manifest.endpointSnapshot,
      execution_id: prepared.executionId,
      governance_tokens: trace.governanceTokens,
      log_schema_version: logSchemaVersion,
      main_worktree_diff_before: manifest.mainWorktreeDiffBefore,
      mode: prepared.mode,
      profile: profile.id,
      raw_log_path: trace.rawLogPath,
      read_trace: trace.readTrace,
      required_read_coverage: trace.requiredReadCoverage,
      run_id: manifest.runId,
      source_head: manifest.sourceHead,
      trace_errors: trace.errors,
      unrelated_category_reads: trace.unrelatedCategoryReads,
      verdict,
      worktree: prepared.worktree,
    }
  })

  const report: RunReport = {
    generated_at: new Date().toISOString(),
    profiles: profileReports,
    run_id: manifest.runId,
    source_head: manifest.sourceHead,
  }
  writeJson(path.join(artifactDir, 'report.json'), report)
  return report
}

export function cleanupRun(artifactDir: string): void {
  const resolvedArtifactDir = path.resolve(artifactDir)
  const manifestPath = path.join(resolvedArtifactDir, 'manifest.json')
  const manifest = readJson<RunManifest>(manifestPath)
  for (const worktree of manifest.ownedWorktrees) {
    if (!isOwnedPath(manifest.worktreeRoot, worktree))
      throw new Error(`REFUSE_UNOWNED_CLEANUP: ${worktree}`)
    removeOwnedWorktree(manifest.rootDir, manifest.worktreeRoot, worktree)
  }
  if (!isOwnedPath(path.dirname(manifest.worktreeRoot), manifest.worktreeRoot))
    throw new Error(`REFUSE_UNOWNED_CLEANUP: ${manifest.worktreeRoot}`)
  fs.rmSync(manifest.worktreeRoot, { force: true, recursive: true })
  writeJson(path.join(resolvedArtifactDir, 'cleanup.json'), {
    cleanedAt: new Date().toISOString(),
    ownedWorktrees: manifest.ownedWorktrees,
    runId: manifest.runId,
  })
}

export function validateReportAgainstProfiles(
  report: RunReport | readonly ProfileReport[],
  expectedProfiles: readonly GovernanceProfile[] = profiles,
): ValidationResult {
  const reports: readonly ProfileReport[] = Array.isArray(report)
    ? report as readonly ProfileReport[]
    : (report as RunReport).profiles
  const issues: string[] = []
  const reportMap = new Map<string, ProfileReport>(reports.map(item => [item.profile, item]))

  for (const profile of expectedProfiles) {
    const item = reportMap.get(profile.id)
    if (!item) {
      issues.push(`${profile.id}:missing_report`)
      continue
    }
    if (item.budget !== profile.budgetTokens)
      issues.push(`${profile.id}:budget_contract_mismatch`)
    if (item.governance_tokens > profile.budgetTokens)
      issues.push(`${profile.id}:budget_exceeded`)
    if (item.required_read_coverage < profile.requiredHitRate)
      issues.push(`${profile.id}:required_read_coverage`)
    if (item.unrelated_category_reads.length > profile.maxForbiddenCategoryHits)
      issues.push(`${profile.id}:forbidden_category_reads`)
    if (item.diff_files.some(file => !profile.allowedPaths.some(pattern => matchesAllowedPath(file, pattern))))
      issues.push(`${profile.id}:diff_outside_allowed_paths`)
    if (item.verdict !== 'passed')
      issues.push(`${profile.id}:verdict_${item.verdict}`)
  }
  for (const profileId of reportMap.keys()) {
    if (!expectedProfiles.some(profile => profile.id === profileId))
      issues.push(`${profileId}:unknown_profile`)
  }
  return { issues, valid: issues.length === 0 }
}

export function assertCleanSource(rootDir: string): void {
  const changes = gitLines(path.resolve(rootDir), ['status', '--porcelain=v1', '--untracked-files=all'])
  if (changes.length > 0)
    throw new Error(`DIRTY_SOURCE: ${changes.join(', ')}`)
}

function loadCodexEndpointSnapshot(file: string): EndpointSnapshot {
  const config = readJson<{ tools?: Record<string, unknown>, version?: unknown }>(file)
  const codex = isRecord(config.tools?.codex) ? config.tools.codex : null
  if (!codex || codex.enabled !== true)
    throw new Error('CODEX_ENDPOINT_UNAVAILABLE')
  return {
    configVersion: typeof config.version === 'string' ? config.version : null,
    enabled: true,
    model: typeof codex.primaryModel === 'string' ? codex.primaryModel : null,
    tags: Array.isArray(codex.tags) ? codex.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    tool: 'codex',
    type: typeof codex.type === 'string' ? codex.type : null,
  }
}

function collectChangedFiles(worktree: string): string[] {
  return parseGitStatusPaths(gitText(worktree, ['status', '--porcelain=v1', '--untracked-files=all']))
}

export function parseGitStatusPaths(output: string): string[] {
  return output
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => {
      const file = line.slice(3)
      return normalizePath(file.includes(' -> ') ? file.split(' -> ').at(-1) ?? file : file)
    })
    .sort()
}

function runGate(gate: GovernanceProfile['gates'][number], worktree: string): GateResult {
  if (gate.kind === 'command') {
    const result = spawnSync(gate.command, { cwd: worktree, encoding: 'utf8', shell: true })
    return { command: gate.command, exitCode: result.status, kind: 'command', passed: result.status === 0 }
  }
  return {
    command: gate.assertion,
    exitCode: null,
    kind: 'static',
    passed: evaluateStaticAssertion(gate.assertion, worktree),
  }
}

function evaluateStaticAssertion(assertion: string, worktree: string): boolean {
  const ciPath = path.join(worktree, '.github', 'workflows', 'ci.yml')
  if (!fs.existsSync(ciPath))
    return false
  const ci = fs.readFileSync(ciPath, 'utf8')
  if (assertion === 'CI static governance remains full')
    return /run:\s*pnpm verify/u.test(ci) && !/pnpm verify[^\n]*--filter/u.test(ci)
  if (assertion === 'CI pull request test/build remain affected-only')
    return /pull_request/u.test(ci) && /filter=\.\.\.\[origin\/\$BASE_REF\]/u.test(ci) && /turbo run test:run --filter/u.test(ci) && /turbo run build --filter/u.test(ci)
  if (assertion === 'CI push test/build remain full')
    return /else[\s\S]*echo "filter="/u.test(ci) && /pnpm test:run/u.test(ci) && /pnpm build/u.test(ci)
  return false
}

function matchesAllowedPath(file: string, allowedPattern: string): boolean {
  const normalizedFile = normalizePath(file)
  const normalizedPattern = normalizePath(allowedPattern)
  if (normalizedPattern.endsWith('/**'))
    return normalizedFile.startsWith(normalizedPattern.slice(0, -3))
  return normalizedFile === normalizedPattern
}

function removeOwnedWorktree(rootDir: string, worktreeRoot: string, worktree: string): void {
  if (!isOwnedPath(worktreeRoot, worktree))
    throw new Error(`REFUSE_UNOWNED_CLEANUP: ${worktree}`)
  const result = spawnSync('git', ['worktree', 'remove', '--force', worktree], { cwd: rootDir, encoding: 'utf8' })
  if (result.status !== 0 && fs.existsSync(worktree))
    throw new Error(`GIT_WORKTREE_REMOVE_FAILED: ${result.stderr.trim()}`)
}

function isOwnedPath(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate))
  return relative.length > 0 && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function assertNode24(): void {
  if (Number.parseInt(process.versions.node.split('.')[0] ?? '', 10) !== 24)
    throw new Error(`NODE_24_REQUIRED: ${process.versions.node}`)
}

function createRunId(): string {
  return `${new Date().toISOString().replace(/[-:.TZ]/gu, '').slice(0, 14)}-${process.pid}`
}

function gitLines(cwd: string, args: string[]): string[] {
  const output = gitText(cwd, args)
  return output.length === 0 ? [] : output.split(/\r?\n/u).filter(Boolean)
}

function gitText(cwd: string, args: string[]): string {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.status !== 0)
    throw new Error(`GIT_COMMAND_FAILED: git ${args.join(' ')}: ${result.stderr.trim()}`)
  return result.stdout.replace(/\r?\n$/u, '')
}

function runGit(cwd: string, args: string[]): void {
  gitText(cwd, args)
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function writeJson(file: string, value: unknown): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/gu, `'"'"'`)}'`
}

function normalizePath(value: string): string {
  return value.split(path.sep).join('/')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function printUsage(): void {
  process.stderr.write('Usage: runner.ts prepare [root] | collect <artifact-dir> | cleanup <artifact-dir>\n')
}

function main(): void {
  const [command, argument] = process.argv.slice(2)
  if (command === 'prepare') {
    const manifest = prepareRun({ rootDir: argument })
    process.stdout.write(`${JSON.stringify({ artifactDir: manifest.artifactDir, commands: manifest.commands }, null, 2)}\n`)
    return
  }
  if (command === 'collect' && argument) {
    process.stdout.write(`${JSON.stringify(collectRun({ artifactDir: argument }), null, 2)}\n`)
    return
  }
  if (command === 'cleanup' && argument) {
    cleanupRun(argument)
    return
  }
  printUsage()
  process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main()
