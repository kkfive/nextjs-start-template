import type { GovernanceProfile } from './profiles.ts'
import type { GovernanceTrace } from './trace.ts'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { holdoutProfiles, profiles, runProfiles } from './profiles.ts'
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

export type ReplayEvidenceOptions = {
  artifactDir?: string
  evidencePaths: readonly string[]
  profileId: string
  redGate: { command: string, expectedExitCode: number, failurePattern: string, forbiddenFailurePatterns?: readonly string[] }
  sourceHead: string
  worktree: string
  worktreeRoot: string
}

export type EvidenceReplayResult = {
  command: string
  error: null | 'missing_evidence_patch' | 'production_file_in_evidence_patch' | 'red_environment_unavailable' | 'red_failure_mismatch' | 'red_patch_apply_failed' | 'red_unexpected_pass' | 'red_wrong_exit_code'
  exitCode: number | null
  output: string
  passed: boolean
  patchFiles: string[]
  patchPath: string | null
}

export type RunManifest = {
  artifactDir: string
  commands: PreparedCommand[]
  endpointSnapshot: EndpointSnapshot
  mainWorktreeDiffBefore: string[]
  ownedWorktrees: string[]
  profileContractHashes: Record<string, string>
  rootDir: string
  runId: string
  sourceHead: string
  worktreeRoot: string
}

export type GateResult = {
  command: string
  exitCode: number | null
  kind: 'command' | 'static'
  output: string
  passed: boolean
}

type AcceptanceAttachment = {
  kind: 'console-log' | 'page-error-log' | 'request' | 'response' | 'review-artifact' | 'screenshot'
  path: string
  sha256: string
}

type AcceptanceBrowserPayload = {
  consoleErrors: string[]
  domAssertions: Array<{ expectation: string, selector: string, value?: string }>
  pageErrors: string[]
  url: string
  viewport: { height: number, width: number }
}

type AcceptanceApiPayload = {
  assertions: Array<{ expectation: string, kind: 'body' | 'schema' | 'status', value?: string }>
  request: { bodyRedacted: boolean, headersRedacted: boolean, method: string, url: string }
  response: { bodyRedacted: boolean, status: number }
}

type AcceptanceReviewerPayload = {
  checklist: Array<{ item: string, notes: string, result: 'failed' | 'not_applicable' | 'passed' }>
  conclusion: string
  executionIdentity: string
  findings: string[]
}

type AcceptanceProvenance
  = | { actor: string, jobIdentity?: string | null, level: 'locally_attested' }
    | {
      actor: string
      githubActor: string
      githubJob: string
      githubRunId: string
      jobIdentity: string
      level: 'independently_verified'
    }

type TrustedAcceptanceProvenance = {
  githubActor: string
  githubJob: string
  githubRunId: string
  jobIdentity: string
}

type AcceptanceEvidence = {
  attachments: AcceptanceAttachment[]
  diffHash: string
  evidenceHash: string
  generatedAt: string
  provenance: AcceptanceProvenance
  result: 'passed'
  runId: string
  sourceHead: string
  verifier: string
} & (
  | { method: 'browser', payload: AcceptanceBrowserPayload }
  | { method: 'api', payload: AcceptanceApiPayload }
  | { method: 'reviewer', payload: AcceptanceReviewerPayload }
)

export type ProfileReport = {
  acceptance_evidence: string | null
  acceptance_evidence_metadata: {
    diffHash: string
    evidenceHash: string
    generatedAt: string
    method: 'api' | 'browser' | 'reviewer'
    provenanceLevel: 'independently_verified' | 'locally_attested'
    result: 'passed'
    runId: string
    sourceHead: string
    verifier: string
  } | null
  budget: number
  cleanup: { owned: boolean, status: 'pending' | 'removed' }
  commands: { delegate: string, gates: GateResult[] }
  diff_files: string[]
  diff_hash: string
  endpoint_snapshot: EndpointSnapshot
  evidence_replay: EvidenceReplayResult | null
  execution_id: string
  governance_tokens: number
  independent_acceptance: {
    method: 'api' | 'browser' | 'reviewer'
    status: 'independently_verified' | 'locally_attested' | 'pending'
  }
  log_schema_version: string
  main_worktree_diff_before: string[]
  mode: 'write'
  mutation_result: MutationCheckResult | null
  profile: string
  raw_log_path: string
  read_trace: GovernanceTrace['readTrace']
  read_trace_observation_limitations: string[]
  raw_read_count: number
  required_read_coverage: number
  run_id: string
  source_head: string
  trace_errors: string[]
  unique_read_count: number
  unrelated_category_reads: string[]
  verdict: 'acceptance_pending' | 'failed' | 'infrastructure_error' | 'passed'
  worktree: string
}

export type RunReport = {
  generated_at: string
  profiles: ProfileReport[]
  run_id: string
  source_head: string
}

export type ValidationOptions = {
  artifactDir?: string
  expectedAcceptanceProvenance?: TrustedAcceptanceProvenance | null
  requireIndependentAcceptance?: boolean
  trustedRootDir?: string
}

export type ValidationResult = {
  assurance: 'evidence_only' | 'live' | 'report_only'
  issues: string[]
  valid: boolean
}

type FinalDiffRecord = {
  files: string[]
  hash: string
}

type IntegritySnapshot = {
  generatedAt: string
  manifestHash: string
  profileContractHashes: Record<string, string>
  profiles: Record<string, {
    diffHash: string
    evidencePatchHash: string | null
    evidencePatchPath: string | null
    finalDiffRecordHash: string
    finalDiffPath: string
    gateHash: string
    gatePath: string
    mutationRecordHash: string | null
    mutationPath: string | null
    rawLogHash: string
    rawLogPath: string
    reportHash: string
  }>
  runId: string
  runReportHash: string
  sourceHead: string
}

export type PrepareRunOptions = {
  artifactRoot?: string
  cliToolsPath?: string
  holdoutProfileIds?: readonly string[]
  rootDir?: string
  runId?: string
  worktreeRoot?: string
}

export type CollectRunOptions = {
  artifactDir: string
  historyDir?: string
  mutationCheck?: typeof verifyMutationSensitivity
  parseTrace?: typeof parseGovernanceTrace
  replayEvidence?: typeof replayEvidence
  runGate?: typeof runGate
}

type MutationCheckOptions = {
  profile: GovernanceProfile
  sourceHead: string
  worktree: string
  worktreeRoot: string
}

export type MutationCheckResult = {
  error: null | 'mutation_environment_unavailable' | 'mutation_not_sensitive' | 'mutation_patch_missing' | 'mutation_setup_missing'
  output: string
  passed: boolean
}

export type RecordAcceptanceOptions = {
  artifactDir: string
  evidence: string
  expectedProvenance?: TrustedAcceptanceProvenance | null
  method: ProfileReport['independent_acceptance']['method']
  profileId: string
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

  const selectedProfiles = options.holdoutProfileIds && options.holdoutProfileIds.length > 0
    ? options.holdoutProfileIds.map((profileId) => {
        const profile = holdoutProfiles.find(candidate => candidate.id === profileId)
        if (!profile)
          throw new Error(`UNKNOWN_HOLDOUT_PROFILE: ${profileId}`)
        return profile
      })
    : runProfiles

  const ownedWorktrees: string[] = []
  try {
    const commands = selectedProfiles.map((profile) => {
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
      profileContractHashes: Object.fromEntries(profiles.map(profile => [profile.id, hashJson(profile)])),
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
  const traceParser = options.parseTrace ?? parseGovernanceTrace
  const evidenceReplayer = options.replayEvidence ?? replayEvidence
  const gateRunner = options.runGate ?? runGate
  const mutationChecker = options.mutationCheck ?? verifyMutationSensitivity

  const profileReports = manifest.commands.map((prepared): ProfileReport => {
    const profile = profileMap.get(prepared.profileId)
    if (!profile)
      throw new Error(`UNKNOWN_PROFILE: ${prepared.profileId}`)
    const externalRawLogPath = path.join(historyDir, `${prepared.executionId}.jsonl`)
    const rawLog = fs.existsSync(externalRawLogPath) ? fs.readFileSync(externalRawLogPath, 'utf8') : ''
    const rawLogArtifactPath = path.join(artifactDir, `${profile.id}-raw.jsonl`)
    fs.writeFileSync(rawLogArtifactPath, rawLog)
    const trace = traceParser(rawLog, profile, {
      rawLogPath: rawLogArtifactPath,
      rootDir: prepared.worktree,
    })
    const evidenceReplay = profile.redGate && profile.evidencePaths
      ? evidenceReplayer({
          artifactDir,
          evidencePaths: profile.evidencePaths,
          profileId: profile.id,
          redGate: profile.redGate,
          sourceHead: manifest.sourceHead,
          worktree: prepared.worktree,
          worktreeRoot: path.join(manifest.worktreeRoot, '.evidence-replay'),
        })
      : null
    const mutationResult = profile.evidenceStrategies?.includes('mutation')
      ? mutationChecker({
          profile,
          sourceHead: manifest.sourceHead,
          worktree: prepared.worktree,
          worktreeRoot: path.join(manifest.worktreeRoot, '.mutation-check'),
        })
      : null
    if (mutationResult)
      writeJson(path.join(artifactDir, `${profile.id}-mutation.json`), mutationResult)
    const gateResults = [...profile.gates, ...(profile.regressionGates ?? [])].map(gate => gateRunner(gate, prepared.worktree))
    writeJson(path.join(artifactDir, `${profile.id}-gates.json`), gateResults)
    const finalDiff = collectWorktreeDiff(prepared.worktree, manifest.sourceHead)
    writeJson(path.join(artifactDir, `${profile.id}-final-diff.json`), finalDiff)
    const hasUnexpectedDiff = finalDiff.files.some(file => !profile.allowedPaths.some(pattern => matchesAllowedPath(file, pattern)))
    const failedOracle = trace.requiredReadCoverage < profile.requiredHitRate
      || trace.unrelatedCategoryReads.length > profile.maxForbiddenCategoryHits
      || trace.governanceTokens > profile.budgetTokens
      || hasUnexpectedDiff
      || (evidenceReplay !== null && !evidenceReplay.passed)
      || (mutationResult !== null && !mutationResult.passed)
      || gateResults.some(gate => !gate.passed)
    const evidenceInfrastructureError = evidenceReplay?.error === 'red_patch_apply_failed'
      || evidenceReplay?.error === 'red_environment_unavailable'
      || mutationResult?.error === 'mutation_environment_unavailable'
    const technicalVerdict = trace.status === 'infrastructure_error' || evidenceInfrastructureError
      ? 'infrastructure_error'
      : failedOracle ? 'failed' : 'passed'
    const verdict = technicalVerdict === 'passed' ? 'acceptance_pending' : technicalVerdict

    return {
      acceptance_evidence: null,
      acceptance_evidence_metadata: null,
      budget: profile.budgetTokens,
      cleanup: { owned: isOwnedPath(manifest.worktreeRoot, prepared.worktree), status: 'pending' },
      commands: { delegate: prepared.command, gates: gateResults },
      diff_files: finalDiff.files,
      diff_hash: finalDiff.hash,
      endpoint_snapshot: manifest.endpointSnapshot,
      evidence_replay: evidenceReplay,
      execution_id: prepared.executionId,
      governance_tokens: trace.governanceTokens,
      independent_acceptance: { method: profile.independentAcceptance, status: 'pending' },
      log_schema_version: logSchemaVersion,
      main_worktree_diff_before: manifest.mainWorktreeDiffBefore,
      mode: prepared.mode,
      mutation_result: mutationResult,
      profile: profile.id,
      raw_log_path: normalizePath(path.relative(artifactDir, rawLogArtifactPath)),
      read_trace: trace.readTrace,
      read_trace_observation_limitations: trace.observationLimitations,
      raw_read_count: trace.rawReadCount,
      required_read_coverage: trace.requiredReadCoverage,
      run_id: manifest.runId,
      source_head: manifest.sourceHead,
      trace_errors: trace.errors,
      unique_read_count: trace.uniqueReadCount,
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
  writeJson(path.join(artifactDir, 'integrity.json'), buildIntegritySnapshot(report, manifest))
  return report
}

export function recordIndependentAcceptance(options: RecordAcceptanceOptions): RunReport {
  if (options.evidence.trim().length === 0)
    throw new Error('ACCEPTANCE_EVIDENCE_REQUIRED')
  const evidenceFile = path.resolve(options.evidence)
  if (!fs.existsSync(evidenceFile) || !fs.statSync(evidenceFile).isFile())
    throw new Error('ACCEPTANCE_EVIDENCE_FILE_REQUIRED')
  const artifactDir = path.resolve(options.artifactDir)
  assertOwnedRegularFile(artifactDir, evidenceFile, 'ACCEPTANCE_EVIDENCE_FILE_REQUIRED')
  if (['commands.json', 'manifest.json', 'report.json', 'cleanup.json', 'integrity.json'].includes(path.basename(evidenceFile)))
    throw new Error('ACCEPTANCE_EVIDENCE_MUST_BE_EXTERNAL')
  const reportPath = path.join(artifactDir, 'report.json')
  const report = readJson<RunReport>(reportPath)
  const profile = profiles.find(candidate => candidate.id === options.profileId)
  const item = report.profiles.find(candidate => candidate.profile === options.profileId)
  if (!profile || !item)
    throw new Error(`UNKNOWN_PROFILE: ${options.profileId}`)
  if (profile.independentAcceptance !== options.method)
    throw new Error(`ACCEPTANCE_METHOD_MISMATCH: ${options.profileId}`)

  const evidence = readJson<AcceptanceEvidence>(evidenceFile)
  const normalized = normalizeAcceptanceEvidence({
    artifactDir,
    evidence,
    evidenceFile,
    executionId: item.execution_id,
    expectedProvenance: options.expectedProvenance,
    method: options.method,
    reportGeneratedAt: report.generated_at,
  })
  const expectedDiffHash = item.diff_hash
  const expectedEvidenceHash = hashAcceptancePayload(evidence as unknown as Record<string, unknown>)
  if (normalized.runId !== item.run_id
    || normalized.sourceHead !== item.source_head
    || normalized.diffHash !== expectedDiffHash
    || normalized.evidenceHash !== expectedEvidenceHash
    || normalized.method !== options.method
    || normalized.result !== 'passed') {
    throw new Error('ACCEPTANCE_EVIDENCE_NOT_BOUND_TO_RUN')
  }

  item.acceptance_evidence = normalizePath(path.relative(artifactDir, evidenceFile))
  item.acceptance_evidence_metadata = {
    diffHash: normalized.diffHash,
    evidenceHash: normalized.evidenceHash,
    generatedAt: normalized.generatedAt,
    method: options.method,
    provenanceLevel: normalized.provenance.level,
    result: normalized.result,
    runId: normalized.runId,
    sourceHead: normalized.sourceHead,
    verifier: normalized.verifier,
  }
  item.independent_acceptance = { method: options.method, status: normalized.provenance.level }
  item.verdict = normalized.provenance.level === 'independently_verified' ? 'passed' : 'acceptance_pending'
  writeJson(reportPath, report)
  const manifestPath = path.join(artifactDir, 'manifest.json')
  if (fs.existsSync(manifestPath))
    writeJson(path.join(artifactDir, 'integrity.json'), buildIntegritySnapshot(report, readJson<RunManifest>(manifestPath)))
  return report
}

const ACCEPTANCE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7

export function normalizeAcceptanceEvidence(options: {
  artifactDir: string
  evidence: AcceptanceEvidence
  evidenceFile: string
  executionId: string
  expectedProvenance?: TrustedAcceptanceProvenance | null
  method: ProfileReport['independent_acceptance']['method']
  reportGeneratedAt: string
}): AcceptanceEvidence {
  const { artifactDir, evidence, evidenceFile, executionId, expectedProvenance, method, reportGeneratedAt } = options
  if (!isRecord(evidence) || evidence.method !== method)
    throw new Error(`ACCEPTANCE_METHOD_SCHEMA_INVALID: ${String(isRecord(evidence) ? evidence.method : typeof evidence)} !== ${method}`)
  if (evidence.verifier.trim() === '' || evidence.verifier === executionId)
    throw new Error('ACCEPTANCE_EVIDENCE_NOT_INDEPENDENT')
  const generatedAt = Date.parse(evidence.generatedAt)
  const reportTime = Date.parse(reportGeneratedAt)
  if (!Number.isFinite(generatedAt) || !Number.isFinite(reportTime) || generatedAt < reportTime || generatedAt - reportTime > ACCEPTANCE_MAX_AGE_MS)
    throw new Error('ACCEPTANCE_EVIDENCE_STALE')
  if (!Array.isArray(evidence.attachments) || evidence.attachments.length === 0)
    throw new Error('ACCEPTANCE_ATTACHMENTS_REQUIRED')
  for (const attachment of evidence.attachments) {
    const attachmentPath = path.resolve(path.dirname(evidenceFile), attachment.path)
    assertOwnedRegularFile(artifactDir, attachmentPath, 'ACCEPTANCE_ATTACHMENT_MISSING')
    const hash = createHash('sha256').update(fs.readFileSync(attachmentPath)).digest('hex')
    if (hash !== attachment.sha256)
      throw new Error('ACCEPTANCE_ATTACHMENT_HASH_MISMATCH')
  }
  if (!isRecord(evidence.provenance) || (evidence.provenance.level !== 'locally_attested' && evidence.provenance.level !== 'independently_verified'))
    throw new Error('ACCEPTANCE_PROVENANCE_REQUIRED')
  if (evidence.provenance.level === 'independently_verified') {
    if (![evidence.provenance.githubRunId, evidence.provenance.githubJob, evidence.provenance.githubActor, evidence.provenance.jobIdentity].every(value => typeof value === 'string' && value.trim().length > 0))
      throw new Error('ACCEPTANCE_INDEPENDENT_PROVENANCE_REQUIRED')
    if (!expectedProvenance
      || evidence.provenance.githubRunId !== expectedProvenance.githubRunId
      || evidence.provenance.githubJob !== expectedProvenance.githubJob
      || evidence.provenance.githubActor !== expectedProvenance.githubActor
      || evidence.provenance.jobIdentity !== expectedProvenance.jobIdentity) {
      throw new Error('ACCEPTANCE_INDEPENDENT_PROVENANCE_UNTRUSTED')
    }
    if (evidence.provenance.jobIdentity === executionId)
      throw new Error('ACCEPTANCE_EVIDENCE_NOT_INDEPENDENT')
  }
  else if (typeof evidence.provenance.actor !== 'string' || evidence.provenance.actor.trim().length === 0) {
    throw new Error('ACCEPTANCE_PROVENANCE_REQUIRED')
  }

  if (method === 'browser') {
    const payload = evidence.payload as AcceptanceBrowserPayload
    if (!isRecord(evidence.payload)
      || typeof payload.url !== 'string'
      || payload.url.trim() === ''
      || !isValidHttpUrl(payload.url)
      || !isRecord(payload.viewport)
      || !isPositiveFinite(payload.viewport.width)
      || !isPositiveFinite(payload.viewport.height)
      || !Array.isArray(payload.domAssertions)
      || payload.domAssertions.length === 0
      || !payload.domAssertions.every(assertion => isRecord(assertion) && isNonemptyString(assertion.selector) && isNonemptyString(assertion.expectation) && (assertion.value === undefined || typeof assertion.value === 'string'))
      || !isStringArray(payload.consoleErrors)
      || !isStringArray(payload.pageErrors)) {
      throw new Error('ACCEPTANCE_BROWSER_EVIDENCE_REQUIRED')
    }
    if (!evidence.attachments.some(attachment => attachment.kind === 'screenshot'))
      throw new Error('ACCEPTANCE_BROWSER_EVIDENCE_REQUIRED')
  }
  else if (method === 'api') {
    const payload = evidence.payload as AcceptanceApiPayload
    if (!isRecord(evidence.payload)
      || !isRecord(payload.request)
      || !isNonemptyString(payload.request.method)
      || !isNonemptyString(payload.request.url)
      || !isValidHttpUrl(payload.request.url)
      || typeof payload.request.bodyRedacted !== 'boolean'
      || typeof payload.request.headersRedacted !== 'boolean'
      || !isRecord(payload.response)
      || typeof payload.response.status !== 'number'
      || typeof payload.response.bodyRedacted !== 'boolean'
      || !Array.isArray(payload.assertions)
      || payload.assertions.length === 0
      || !payload.assertions.every(assertion => isRecord(assertion) && ['body', 'schema', 'status'].includes(String(assertion.kind)) && isNonemptyString(assertion.expectation) && (assertion.value === undefined || typeof assertion.value === 'string'))) {
      throw new Error('ACCEPTANCE_API_EVIDENCE_REQUIRED')
    }
    if (!evidence.attachments.some(attachment => attachment.kind === 'request') || !evidence.attachments.some(attachment => attachment.kind === 'response'))
      throw new Error('ACCEPTANCE_API_EVIDENCE_REQUIRED')
  }
  else {
    const payload = evidence.payload as AcceptanceReviewerPayload
    if (!isRecord(evidence.payload)
      || typeof payload.executionIdentity !== 'string'
      || payload.executionIdentity.trim() === ''
      || payload.executionIdentity === executionId
      || typeof payload.conclusion !== 'string'
      || payload.conclusion.trim() === ''
      || !isStringArray(payload.findings)
      || !Array.isArray(payload.checklist)
      || payload.checklist.length === 0
      || !payload.checklist.every(check => isRecord(check) && isNonemptyString(check.item) && isNonemptyString(check.notes) && ['failed', 'not_applicable', 'passed'].includes(String(check.result)))) {
      throw new Error('ACCEPTANCE_REVIEWER_EVIDENCE_REQUIRED')
    }
  }
  return evidence
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

export function replayEvidence(options: ReplayEvidenceOptions): EvidenceReplayResult {
  const changedFiles = collectChangedFiles(options.worktree)
  const patchFiles = changedFiles.filter(file => options.evidencePaths.some(pattern => matchesAllowedPath(file, pattern)))
  const base = {
    command: options.redGate.command,
    exitCode: null,
    output: '',
    passed: false,
    patchFiles,
    patchPath: null,
  }
  if (patchFiles.length === 0)
    return { ...base, error: 'missing_evidence_patch' }
  if (patchFiles.some(file => !isEvidenceFile(file)))
    return { ...base, error: 'production_file_in_evidence_patch' }

  for (const file of patchFiles) {
    if (fs.existsSync(path.join(options.worktree, file)))
      gitText(options.worktree, ['add', '-N', '--', file])
  }
  const patch = gitRaw(options.worktree, ['diff', '--binary', options.sourceHead, '--', ...patchFiles])
  gitText(options.worktree, ['reset', '--quiet', options.sourceHead, '--', ...patchFiles])
  if (patch.length === 0)
    return { ...base, error: 'missing_evidence_patch' }
  const patchPath = options.artifactDir ? path.join(options.artifactDir, `${options.profileId}-evidence.patch`) : null
  if (patchPath)
    fs.writeFileSync(patchPath, patch)
  const resultBase = { ...base, patchPath }

  const redWorktree = path.resolve(options.worktreeRoot, `${options.profileId}-red`)
  fs.mkdirSync(path.dirname(redWorktree), { recursive: true })
  try {
    runGit(options.worktree, ['worktree', 'add', '--detach', redWorktree, options.sourceHead])
    const apply = spawnSync('git', ['apply', '--binary', '--index', '-'], { cwd: redWorktree, encoding: 'utf8', input: patch })
    if (apply.status !== 0)
      return { ...resultBase, error: 'red_patch_apply_failed', output: apply.stderr.trim() }

    const dependencyRoot = findDependencyRoot(options.worktree)
    const inheritedBin = path.join(dependencyRoot, 'node_modules', '.bin')
    if (/^pnpm(?:\s|$)/u.test(options.redGate.command) && !fs.existsSync(inheritedBin))
      return { ...resultBase, error: 'red_environment_unavailable', output: `missing dependency bin: ${inheritedBin}` }
    for (const relative of ['node_modules', 'apps/client/node_modules', 'packages/http-client/node_modules']) {
      const source = path.join(dependencyRoot, relative)
      const target = path.join(redWorktree, relative)
      if (fs.existsSync(source) && !fs.existsSync(target)) {
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.symlinkSync(source, target, 'dir')
      }
    }
    const result = spawnSync(options.redGate.command, {
      cwd: redWorktree,
      encoding: 'utf8',
      env: { ...process.env, CI: 'true', PATH: `${inheritedBin}${path.delimiter}${process.env.PATH ?? ''}` },
      shell: true,
    })
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().slice(-8000)
    const exitCode = result.status
    if (result.error || exitCode === null)
      return { ...resultBase, error: 'red_environment_unavailable', exitCode, output: `${output}\n${result.error?.message ?? ''}`.trim() }
    if (exitCode === 0 && options.redGate.expectedExitCode !== 0)
      return { ...resultBase, error: 'red_unexpected_pass', exitCode, output }
    if (exitCode !== options.redGate.expectedExitCode)
      return { ...resultBase, error: 'red_wrong_exit_code', exitCode, output }
    if (options.redGate.forbiddenFailurePatterns?.some(pattern => new RegExp(pattern, 'iu').test(output)))
      return { ...resultBase, error: 'red_environment_unavailable', exitCode, output }
    if (!new RegExp(options.redGate.failurePattern, 'u').test(output))
      return { ...resultBase, error: 'red_failure_mismatch', exitCode, output }
    return { ...resultBase, error: null, exitCode, output, passed: true }
  }
  finally {
    if (fs.existsSync(redWorktree))
      removeOwnedWorktree(options.worktree, path.dirname(redWorktree), redWorktree)
  }
}

function isEvidenceFile(file: string): boolean {
  return /(?:^|\/)(?:__fixtures__|fixtures?)(?:\/|$)/u.test(file)
    || /\.(?:spec|test)\.[cm]?[jt]sx?$/u.test(file)
}

export function validateReportAgainstProfiles(
  report: RunReport | readonly ProfileReport[],
  expectedProfiles: readonly GovernanceProfile[] = profiles,
  options: ValidationOptions = {},
): ValidationResult {
  const isRunReport = !Array.isArray(report)
  const runReport: RunReport | null = isRunReport ? report as RunReport : null
  const reports: readonly ProfileReport[] = isRunReport
    ? (report as RunReport).profiles
    : report as readonly ProfileReport[]
  const issues: string[] = []
  const reportMap = new Map<string, ProfileReport>(reports.map(item => [item.profile, item]))
  const artifactDir = options.artifactDir ? path.resolve(options.artifactDir) : null
  const manifest = artifactDir && fs.existsSync(path.join(artifactDir, 'manifest.json'))
    ? readJson<RunManifest>(path.join(artifactDir, 'manifest.json'))
    : null
  const integrity = artifactDir && fs.existsSync(path.join(artifactDir, 'integrity.json'))
    ? readJson<IntegritySnapshot>(path.join(artifactDir, 'integrity.json'))
    : null
  const assurance = determineValidationAssurance(artifactDir, manifest, integrity)
  const executionSafety = assurance === 'live'
    ? determineExecutionSafety(artifactDir, manifest, integrity, expectedProfiles, options.trustedRootDir)
    : { issues: [], safe: false }
  issues.push(...executionSafety.issues)

  if (runReport) {
    if (artifactDir && manifest) {
      if (runReport.run_id !== manifest.runId)
        issues.push('run_id_mismatch')
      if (runReport.source_head !== manifest.sourceHead)
        issues.push('source_head_mismatch')
    }
    if (integrity) {
      if (runReport.run_id !== integrity.runId)
        issues.push('integrity_run_id_mismatch')
      if (runReport.source_head !== integrity.sourceHead)
        issues.push('integrity_source_head_mismatch')
      if (integrity.runReportHash !== hashJson(runReport))
        issues.push('run_report_hash_mismatch')
    }
  }

  if (artifactDir && manifest && integrity) {
    if (integrity.manifestHash !== hashJson(manifest))
      issues.push('manifest_hash_mismatch')
    if (JSON.stringify(integrity.profileContractHashes) !== JSON.stringify(manifest.profileContractHashes))
      issues.push('integrity_profile_contract_hashes_mismatch')
  }

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

    if (artifactDir && manifest && integrity) {
      const prepared = manifest.commands.find(command => command.profileId === profile.id)
      const profileIntegrity = integrity.profiles[profile.id]
      if (manifest.profileContractHashes?.[profile.id] !== hashJson(profile))
        issues.push(`${profile.id}:profile_contract_hash_mismatch`)
      if (integrity.profileContractHashes?.[profile.id] !== hashJson(profile))
        issues.push(`${profile.id}:integrity_profile_contract_hash_mismatch`)
      if (!prepared) {
        issues.push(`${profile.id}:missing_prepared_command`)
      }
      else if (!profileIntegrity) {
        issues.push(`${profile.id}:missing_integrity_profile`)
      }
      else {
        const rawArtifactPath = path.resolve(artifactDir, profileIntegrity.rawLogPath)
        if (!isOwnedPath(artifactDir, rawArtifactPath) || !fs.existsSync(rawArtifactPath)) {
          issues.push(`${profile.id}:raw_log_artifact_missing`)
        }
        else {
          const rawLog = fs.readFileSync(rawArtifactPath, 'utf8')
          if (createHash('sha256').update(rawLog).digest('hex') !== profileIntegrity.rawLogHash)
            issues.push(`${profile.id}:raw_log_hash_mismatch`)
          const trace = parseGovernanceTrace(rawLog, profile, { rawLogPath: rawArtifactPath, rootDir: prepared.worktree })
          if (trace.requiredReadCoverage !== item.required_read_coverage)
            issues.push(`${profile.id}:required_read_coverage_tampered`)
          if (trace.governanceTokens !== item.governance_tokens)
            issues.push(`${profile.id}:governance_tokens_tampered`)
          if (JSON.stringify(trace.readTrace) !== JSON.stringify(item.read_trace))
            issues.push(`${profile.id}:read_trace_tampered`)
          if (trace.rawReadCount !== item.raw_read_count || trace.uniqueReadCount !== item.unique_read_count)
            issues.push(`${profile.id}:read_count_tampered`)
          if (JSON.stringify(trace.unrelatedCategoryReads) !== JSON.stringify(item.unrelated_category_reads))
            issues.push(`${profile.id}:forbidden_reads_tampered`)
          if (JSON.stringify(trace.errors) !== JSON.stringify(item.trace_errors))
            issues.push(`${profile.id}:trace_errors_tampered`)
        }

        const gatesArtifactPath = path.resolve(artifactDir, profileIntegrity.gatePath)
        if (!isOwnedPath(artifactDir, gatesArtifactPath) || !fs.existsSync(gatesArtifactPath)) {
          issues.push(`${profile.id}:gate_artifact_missing`)
        }
        else {
          const gateArtifact = readJson<GateResult[]>(gatesArtifactPath)
          if (hashJson(gateArtifact) !== profileIntegrity.gateHash)
            issues.push(`${profile.id}:gate_hash_mismatch`)
          if (JSON.stringify(gateArtifact) !== JSON.stringify(item.commands.gates))
            issues.push(`${profile.id}:gate_report_tampered`)
          if (assurance === 'live' && executionSafety.safe) {
            const rerunGates = [...profile.gates, ...(profile.regressionGates ?? [])].map(gate => runGate(gate, prepared.worktree))
            if (JSON.stringify(rerunGates) !== JSON.stringify(gateArtifact))
              issues.push(`${profile.id}:gate_live_mismatch`)
          }
        }

        const finalDiffArtifactPath = path.resolve(artifactDir, profileIntegrity.finalDiffPath)
        if (!isOwnedPath(artifactDir, finalDiffArtifactPath) || !fs.existsSync(finalDiffArtifactPath)) {
          issues.push(`${profile.id}:final_diff_artifact_missing`)
        }
        else {
          const finalDiffRecord = readJson<FinalDiffRecord>(finalDiffArtifactPath)
          if (hashJson(finalDiffRecord) !== profileIntegrity.finalDiffRecordHash)
            issues.push(`${profile.id}:final_diff_record_hash_mismatch`)
          if (JSON.stringify(finalDiffRecord.files) !== JSON.stringify(item.diff_files))
            issues.push(`${profile.id}:diff_files_tampered`)
          if (finalDiffRecord.hash !== item.diff_hash || profileIntegrity.diffHash !== item.diff_hash)
            issues.push(`${profile.id}:diff_hash_tampered`)
          if (assurance === 'live' && executionSafety.safe) {
            const recomputedDiff = collectWorktreeDiff(prepared.worktree, manifest.sourceHead)
            if (JSON.stringify(recomputedDiff.files) !== JSON.stringify(finalDiffRecord.files))
              issues.push(`${profile.id}:live_diff_files_mismatch`)
            if (recomputedDiff.hash !== finalDiffRecord.hash)
              issues.push(`${profile.id}:live_diff_hash_mismatch`)
          }
        }

        const reportHash = hashJson(item)
        if (profileIntegrity.reportHash !== reportHash)
          issues.push(`${profile.id}:report_hash_mismatch`)

        if (profile.evidenceStrategies?.includes('mutation')) {
          const mutationPath = profileIntegrity.mutationPath ? path.resolve(artifactDir, profileIntegrity.mutationPath) : null
          if (!item.mutation_result) {
            issues.push(`${profile.id}:missing_mutation_result`)
          }
          else if (!mutationPath || !isOwnedPath(artifactDir, mutationPath) || !fs.existsSync(mutationPath)) {
            issues.push(`${profile.id}:mutation_artifact_missing`)
          }
          else {
            const mutationArtifact = readJson<MutationCheckResult>(mutationPath)
            if (profileIntegrity.mutationRecordHash !== hashJson(mutationArtifact))
              issues.push(`${profile.id}:mutation_hash_mismatch`)
            if (!equivalentMutationResult(mutationArtifact, item.mutation_result))
              issues.push(`${profile.id}:mutation_report_tampered`)
            if (assurance === 'live' && executionSafety.safe) {
              const rerunMutation = verifyMutationSensitivity({
                profile,
                sourceHead: manifest.sourceHead,
                worktree: prepared.worktree,
                worktreeRoot: path.join(manifest.worktreeRoot, '.validation-mutation-check'),
              })
              if (!equivalentMutationResult(rerunMutation, mutationArtifact))
                issues.push(`${profile.id}:mutation_live_mismatch`)
            }
          }
        }

        if (profile.redGate) {
          const patchPath = profileIntegrity.evidencePatchPath ? path.resolve(artifactDir, profileIntegrity.evidencePatchPath) : null
          if (!item.evidence_replay) {
            issues.push(`${profile.id}:missing_evidence_replay`)
          }
          else {
            if (item.evidence_replay.command !== profile.redGate.command)
              issues.push(`${profile.id}:red_command_mismatch`)
            if (!item.evidence_replay.passed || item.evidence_replay.error !== null)
              issues.push(`${profile.id}:invalid_red_replay`)
            if (item.evidence_replay.exitCode !== profile.redGate.expectedExitCode)
              issues.push(`${profile.id}:red_exit_code_mismatch`)
            if (!new RegExp(profile.redGate.failurePattern, 'u').test(item.evidence_replay.output))
              issues.push(`${profile.id}:red_failure_pattern_mismatch`)
            if (profile.redGate.forbiddenFailurePatterns.some(pattern => new RegExp(pattern, 'iu').test(item.evidence_replay!.output)))
              issues.push(`${profile.id}:red_infrastructure_failure`)
            if (item.evidence_replay.patchFiles.some(file => !(profile.evidencePaths ?? []).some(pattern => matchesAllowedPath(file, pattern))))
              issues.push(`${profile.id}:red_evidence_outside_contract`)
            if (patchPath) {
              if (!isOwnedPath(artifactDir, patchPath) || !fs.existsSync(patchPath)) {
                issues.push(`${profile.id}:red_evidence_patch_missing`)
              }
              else if (createHash('sha256').update(fs.readFileSync(patchPath, 'utf8')).digest('hex') !== profileIntegrity.evidencePatchHash) {
                issues.push(`${profile.id}:red_evidence_patch_hash_mismatch`)
              }
            }
            if (assurance === 'live' && executionSafety.safe) {
              const rerunReplay = replayEvidence({
                artifactDir,
                evidencePaths: profile.evidencePaths ?? [],
                profileId: profile.id,
                redGate: profile.redGate,
                sourceHead: manifest.sourceHead,
                worktree: prepared.worktree,
                worktreeRoot: path.join(manifest.worktreeRoot, '.validation-evidence-replay'),
              })
              if (!equivalentReplayResult(rerunReplay, item.evidence_replay))
                issues.push(`${profile.id}:red_live_mismatch`)
            }
          }
        }
      }
    }
    else if (profile.redGate) {
      if (!item.evidence_replay) {
        issues.push(`${profile.id}:missing_evidence_replay`)
      }
      else {
        if (item.evidence_replay.command !== profile.redGate.command)
          issues.push(`${profile.id}:red_command_mismatch`)
        if (!item.evidence_replay.passed || item.evidence_replay.error !== null)
          issues.push(`${profile.id}:invalid_red_replay`)
        if (item.evidence_replay.exitCode !== profile.redGate.expectedExitCode)
          issues.push(`${profile.id}:red_exit_code_mismatch`)
        if (!new RegExp(profile.redGate.failurePattern, 'u').test(item.evidence_replay.output))
          issues.push(`${profile.id}:red_failure_pattern_mismatch`)
        if (profile.redGate.forbiddenFailurePatterns.some(pattern => new RegExp(pattern, 'iu').test(item.evidence_replay!.output)))
          issues.push(`${profile.id}:red_infrastructure_failure`)
        if (item.evidence_replay.patchFiles.some(file => !(profile.evidencePaths ?? []).some(pattern => matchesAllowedPath(file, pattern))))
          issues.push(`${profile.id}:red_evidence_outside_contract`)
      }
    }

    const expectedGates = [...profile.gates, ...(profile.regressionGates ?? [])]
      .map(gate => gate.kind === 'command' ? gate.command : gate.assertion)
    for (const gate of expectedGates) {
      const observed = item.commands.gates.find(result => result.command === gate)
      if (!observed)
        issues.push(`${profile.id}:missing_gate:${gate}`)
      else if (!observed.passed)
        issues.push(`${profile.id}:failed_gate:${gate}`)
    }
    if (item.independent_acceptance.method !== profile.independentAcceptance)
      issues.push(`${profile.id}:independent_acceptance_method`)
    if (options.requireIndependentAcceptance !== false && item.verdict === 'acceptance_pending')
      issues.push(`${profile.id}:independent_acceptance_pending`)
    if (options.requireIndependentAcceptance !== false && item.verdict === 'passed' && (item.independent_acceptance.status !== 'independently_verified' || !item.acceptance_evidence || !item.acceptance_evidence_metadata))
      issues.push(`${profile.id}:independent_acceptance_missing`)
    if (item.acceptance_evidence_metadata) {
      if (artifactDir) {
        const evidenceFile = item.acceptance_evidence
          ? path.resolve(artifactDir, item.acceptance_evidence)
          : null
        if (!evidenceFile || !isOwnedPath(artifactDir, evidenceFile) || !fs.existsSync(evidenceFile) || !fs.statSync(evidenceFile).isFile()) {
          issues.push(`${profile.id}:independent_acceptance_evidence_missing`)
        }
        else {
          try {
            const evidence = readJson<AcceptanceEvidence>(evidenceFile)
            const normalized = normalizeAcceptanceEvidence({
              artifactDir,
              evidence,
              evidenceFile,
              executionId: item.execution_id,
              expectedProvenance: options.expectedAcceptanceProvenance,
              method: profile.independentAcceptance,
              reportGeneratedAt: runReport?.generated_at ?? item.acceptance_evidence_metadata.generatedAt,
            })
            if (hashAcceptancePayload(evidence as unknown as Record<string, unknown>) !== item.acceptance_evidence_metadata.evidenceHash)
              issues.push(`${profile.id}:independent_acceptance_evidence_hash`)
            if (normalized.provenance.level !== item.acceptance_evidence_metadata.provenanceLevel)
              issues.push(`${profile.id}:independent_acceptance_provenance_level`)
            if (normalized.provenance.level !== item.independent_acceptance.status)
              issues.push(`${profile.id}:independent_acceptance_status`)
          }
          catch (error) {
            issues.push(`${profile.id}:independent_acceptance_evidence_invalid`)
            if (error instanceof Error)
              issues.push(`${profile.id}:${error.message}`)
          }
        }
      }
      if (item.acceptance_evidence_metadata.runId !== item.run_id
        || item.acceptance_evidence_metadata.sourceHead !== item.source_head
        || item.acceptance_evidence_metadata.diffHash !== item.diff_hash
        || item.acceptance_evidence_metadata.evidenceHash.length !== 64
        || item.acceptance_evidence_metadata.result !== 'passed'
        || item.acceptance_evidence_metadata.method !== profile.independentAcceptance
        || !['locally_attested', 'independently_verified'].includes(item.acceptance_evidence_metadata.provenanceLevel)) {
        issues.push(`${profile.id}:independent_acceptance_binding`)
      }
    }
    if (item.verdict !== 'passed' && item.verdict !== 'acceptance_pending')
      issues.push(`${profile.id}:verdict_${item.verdict}`)
    if (options.requireIndependentAcceptance === false && item.verdict === 'passed' && item.independent_acceptance.status !== 'independently_verified')
      issues.push(`${profile.id}:invalid_pass_without_acceptance`)
  }
  for (const profileId of reportMap.keys()) {
    if (!expectedProfiles.some(profile => profile.id === profileId))
      issues.push(`${profileId}:unknown_profile`)
  }
  return { assurance, issues, valid: issues.length === 0 }
}

function determineValidationAssurance(
  artifactDir: string | null,
  manifest: RunManifest | null,
  integrity: IntegritySnapshot | null,
): ValidationResult['assurance'] {
  if (!artifactDir || !manifest || !integrity)
    return 'report_only'
  const hasEvidenceArtifacts = Object.values(integrity.profiles).every((item) => {
    const gatePath = path.resolve(artifactDir, item.gatePath)
    const rawLogPath = path.resolve(artifactDir, item.rawLogPath)
    const finalDiffPath = path.resolve(artifactDir, item.finalDiffPath)
    const patchOk = item.evidencePatchPath === null || fs.existsSync(path.resolve(artifactDir, item.evidencePatchPath))
    const mutationOk = item.mutationPath === null || fs.existsSync(path.resolve(artifactDir, item.mutationPath))
    return fs.existsSync(gatePath) && fs.existsSync(rawLogPath) && fs.existsSync(finalDiffPath) && patchOk && mutationOk
  })
  if (!hasEvidenceArtifacts)
    return 'report_only'
  const allWorktreesPresent = manifest.commands.every(command => fs.existsSync(path.join(command.worktree, '.git')))
  return allWorktreesPresent ? 'live' : 'evidence_only'
}

function equivalentReplayResult(left: EvidenceReplayResult, right: EvidenceReplayResult): boolean {
  return JSON.stringify({ ...left, patchPath: null }) === JSON.stringify({ ...right, patchPath: null })
}

function equivalentMutationResult(left: MutationCheckResult, right: MutationCheckResult): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function determineExecutionSafety(
  artifactDir: string | null,
  manifest: RunManifest | null,
  integrity: IntegritySnapshot | null,
  expectedProfiles: readonly GovernanceProfile[],
  trustedRootDir?: string,
): { issues: string[], safe: boolean } {
  if (!artifactDir || !manifest || !integrity)
    return { issues: [], safe: false }

  const issues: string[] = []
  if (integrity.manifestHash !== hashJson(manifest))
    issues.push('manifest_hash_mismatch')
  if (JSON.stringify(integrity.profileContractHashes) !== JSON.stringify(manifest.profileContractHashes))
    issues.push('integrity_profile_contract_hashes_mismatch')
  if (integrity.runId !== manifest.runId)
    issues.push('integrity_run_id_mismatch')
  if (integrity.sourceHead !== manifest.sourceHead)
    issues.push('integrity_source_head_mismatch')

  const worktreeRootRealpath = safeRealpath(manifest.worktreeRoot)
  const rootDirRealpath = safeRealpath(manifest.rootDir)
  const trustedRootRealpath = safeRealpath(path.resolve(trustedRootDir ?? process.cwd()))
  if (!worktreeRootRealpath || !rootDirRealpath)
    issues.push('validation_worktree_root_missing')
  if (!trustedRootRealpath || rootDirRealpath !== trustedRootRealpath) {
    issues.push('validation_untrusted_repository_root')
  }
  else {
    try {
      if (gitText(rootDirRealpath, ['rev-parse', 'HEAD']) !== manifest.sourceHead)
        issues.push('validation_trusted_source_head_mismatch')
    }
    catch {
      issues.push('validation_trusted_repository_invalid')
    }
  }

  for (const profile of expectedProfiles) {
    const prepared = manifest.commands.find(command => command.profileId === profile.id)
    if (!prepared) {
      issues.push(`${profile.id}:missing_prepared_command`)
      continue
    }
    if (manifest.profileContractHashes?.[profile.id] !== hashJson(profile))
      issues.push(`${profile.id}:profile_contract_hash_mismatch`)
    if (integrity.profileContractHashes?.[profile.id] !== hashJson(profile))
      issues.push(`${profile.id}:integrity_profile_contract_hash_mismatch`)

    const worktreeRealpath = safeRealpath(prepared.worktree)
    if (!worktreeRealpath || !worktreeRootRealpath || !isOwnedPath(worktreeRootRealpath, worktreeRealpath)) {
      issues.push(`${profile.id}:worktree_not_run_owned`)
      continue
    }
    try {
      const commonDir = gitText(worktreeRealpath, ['rev-parse', '--git-common-dir'])
      const commonDirRealpath = safeRealpath(path.resolve(worktreeRealpath, commonDir))
      if (!commonDirRealpath || !rootDirRealpath || !isOwnedPath(rootDirRealpath, commonDirRealpath))
        issues.push(`${profile.id}:worktree_git_root_mismatch`)
      const head = gitText(worktreeRealpath, ['rev-parse', 'HEAD'])
      if (head !== manifest.sourceHead)
        issues.push(`${profile.id}:worktree_head_mismatch`)
    }
    catch {
      issues.push(`${profile.id}:worktree_git_state_invalid`)
    }
  }

  return { issues, safe: issues.length === 0 }
}

export function assertCleanSource(rootDir: string): void {
  const changes = gitLines(path.resolve(rootDir), ['status', '--porcelain=v1', '--untracked-files=all'])
  if (changes.length > 0) {
    throw new Error(`DIRTY_SOURCE: ${changes.join(', ')}`)
  }
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

export function collectWorktreeDiff(worktree: string, sourceHead: string): { files: string[], hash: string } {
  return {
    files: collectChangedFiles(worktree),
    hash: hashWorktreeDiff(worktree, sourceHead),
  }
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
    const dependencyRoot = findDependencyRoot(worktree)
    const inheritedBin = path.join(dependencyRoot, 'node_modules', '.bin')
    const result = spawnSync(gate.command, {
      cwd: worktree,
      encoding: 'utf8',
      env: { ...process.env, CI: 'true', PATH: `${inheritedBin}${path.delimiter}${process.env.PATH ?? ''}` },
      shell: true,
    })
    return {
      command: gate.command,
      exitCode: result.status,
      kind: 'command',
      output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().slice(-4000),
      passed: result.status === 0,
    }
  }
  return {
    command: gate.assertion,
    exitCode: null,
    kind: 'static',
    output: '',
    passed: evaluateStaticAssertion(gate.assertion, worktree),
  }
}

export function verifyMutationSensitivity(options: MutationCheckOptions): MutationCheckResult {
  if (!options.profile.evidenceStrategies?.includes('mutation'))
    return { error: null, output: '', passed: true }
  const targetFile = path.join(options.worktree, 'packages', 'http-client', 'src', 'error.ts')
  if (!fs.existsSync(targetFile))
    return { error: 'mutation_setup_missing', output: targetFile, passed: false }
  const source = fs.readFileSync(targetFile, 'utf8')
  const mutationNeedle = '    this.code = _options?.code\n'
  if (!source.includes(mutationNeedle))
    return { error: 'mutation_setup_missing', output: 'mutation needle missing', passed: false }
  const mutated = source.replace(mutationNeedle, '    this.code = undefined\n')
  const mutationWorktree = path.resolve(options.worktreeRoot, `${options.profile.id}-mutation`)
  fs.mkdirSync(path.dirname(mutationWorktree), { recursive: true })
  try {
    runGit(options.worktree, ['worktree', 'add', '--detach', mutationWorktree, options.sourceHead])
    const mutationTarget = path.join(mutationWorktree, 'packages', 'http-client', 'src', 'error.ts')
    fs.mkdirSync(path.dirname(mutationTarget), { recursive: true })
    fs.writeFileSync(mutationTarget, mutated)
    const dependencyRoot = findDependencyRoot(options.worktree)
    const inheritedBin = path.join(dependencyRoot, 'node_modules', '.bin')
    for (const relative of ['node_modules', 'packages/http-client/node_modules']) {
      const sourceDir = path.join(dependencyRoot, relative)
      const targetDir = path.join(mutationWorktree, relative)
      if (fs.existsSync(sourceDir) && !fs.existsSync(targetDir)) {
        fs.mkdirSync(path.dirname(targetDir), { recursive: true })
        fs.symlinkSync(sourceDir, targetDir, 'dir')
      }
    }
    const result = spawnSync('pnpm --filter @kkfive/http-client test:run', {
      cwd: mutationWorktree,
      encoding: 'utf8',
      env: { ...process.env, CI: 'true', PATH: `${inheritedBin}${path.delimiter}${process.env.PATH ?? ''}` },
      shell: true,
    })
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().slice(-4000)
    if (result.error || result.status === null)
      return { error: 'mutation_environment_unavailable', output: `${output}\n${result.error?.message ?? ''}`.trim(), passed: false }
    if (result.status === 0)
      return { error: 'mutation_not_sensitive', output, passed: false }
    return { error: null, output, passed: true }
  }
  finally {
    if (fs.existsSync(mutationWorktree))
      removeOwnedWorktree(options.worktree, path.dirname(mutationWorktree), mutationWorktree)
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
  if (!/[?*]/u.test(normalizedPattern))
    return normalizedFile === normalizedPattern

  let expression = ''
  for (let index = 0; index < normalizedPattern.length; index += 1) {
    const character = normalizedPattern[index] ?? ''
    if (character === '*' && normalizedPattern[index + 1] === '*') {
      if (normalizedPattern[index + 2] === '/') {
        expression += '(?:.*/)?'
        index += 2
      }
      else {
        expression += '.*'
        index += 1
      }
    }
    else if (character === '*') {
      expression += '[^/]*'
    }
    else if (character === '?') {
      expression += '[^/]'
    }
    else {
      expression += character.replace(/[.+^${}()|[\]\\]/gu, '\\$&')
    }
  }
  return new RegExp(`^${expression}$`, 'u').test(normalizedFile)
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

function gitRaw(cwd: string, args: string[]): string {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.status !== 0)
    throw new Error(`GIT_COMMAND_FAILED: git ${args.join(' ')}: ${result.stderr.trim()}`)
  return result.stdout
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

function hashJson(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function buildIntegritySnapshot(report: RunReport, manifest: RunManifest): IntegritySnapshot {
  return {
    generatedAt: report.generated_at,
    manifestHash: hashJson(manifest),
    profileContractHashes: manifest.profileContractHashes,
    profiles: Object.fromEntries(report.profiles.map((item) => {
      const artifactDir = manifest.artifactDir
      const rawLogPath = normalizePath(item.raw_log_path)
      const rawLogFile = path.resolve(artifactDir, rawLogPath)
      const gatePath = `${item.profile}-gates.json`
      const gateFile = path.join(artifactDir, gatePath)
      const finalDiffPath = `${item.profile}-final-diff.json`
      const finalDiffFile = path.join(artifactDir, finalDiffPath)
      const evidencePatchPath = item.evidence_replay?.patchPath && isOwnedPath(artifactDir, item.evidence_replay.patchPath)
        ? normalizePath(path.relative(artifactDir, item.evidence_replay.patchPath))
        : null
      const evidencePatch = evidencePatchPath && fs.existsSync(path.resolve(artifactDir, evidencePatchPath))
        ? fs.readFileSync(path.resolve(artifactDir, evidencePatchPath), 'utf8')
        : null
      const mutationPath = item.mutation_result ? `${item.profile}-mutation.json` : null
      const mutationFile = mutationPath ? path.join(artifactDir, mutationPath) : null
      return [item.profile, {
        diffHash: item.diff_hash,
        evidencePatchHash: evidencePatch === null ? null : createHash('sha256').update(evidencePatch).digest('hex'),
        evidencePatchPath,
        finalDiffRecordHash: hashJson(readJson<FinalDiffRecord>(finalDiffFile)),
        finalDiffPath,
        gateHash: hashJson(readJson<GateResult[]>(gateFile)),
        gatePath,
        mutationRecordHash: mutationFile && fs.existsSync(mutationFile) ? hashJson(readJson<MutationCheckResult>(mutationFile)) : null,
        mutationPath,
        rawLogHash: createHash('sha256').update(fs.readFileSync(rawLogFile, 'utf8')).digest('hex'),
        rawLogPath,
        reportHash: hashJson(item),
      }]
    })),
    runId: report.run_id,
    runReportHash: hashJson(report),
    sourceHead: report.source_head,
  }
}

function findDependencyRoot(start: string): string {
  let current = path.resolve(start)
  while (true) {
    if (fs.existsSync(path.join(current, 'node_modules', '.bin')))
      return current
    const parent = path.dirname(current)
    if (parent === current)
      return path.resolve(start)
    current = parent
  }
}

function hashWorktreeDiff(worktree: string, sourceHead: string): string {
  const changes = collectChangedFiles(worktree)
  for (const file of changes) {
    if (fs.existsSync(path.join(worktree, file)))
      gitText(worktree, ['add', '-N', '--', file])
  }
  const patch = gitRaw(worktree, ['diff', '--binary', sourceHead])
  if (changes.length > 0)
    gitText(worktree, ['reset', '--quiet', sourceHead, '--', ...changes])
  return createHash('sha256').update(patch).digest('hex')
}

function hashAcceptancePayload(metadata: Record<string, unknown>): string {
  const normalized = {
    attachments: metadata.attachments ?? null,
    method: metadata.method ?? null,
    payload: metadata.payload ?? null,
    provenance: metadata.provenance ?? null,
  }
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/gu, `'"'"'`)}'`
}

function safeRealpath(value: string): string | null {
  try {
    return fs.realpathSync.native(path.resolve(value))
  }
  catch {
    return null
  }
}

function assertOwnedRegularFile(root: string, file: string, errorCode: string): void {
  if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.lstatSync(file).isFile())
    throw new Error(errorCode)
  const realRoot = fs.realpathSync(root)
  const realFile = fs.realpathSync(file)
  if (!isOwnedPath(realRoot, realFile))
    throw new Error(errorCode)
}

function normalizePath(value: string): string {
  return value.split(path.sep).join('/')
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  catch {
    return false
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function trustedAcceptanceProvenanceFromEnv(): TrustedAcceptanceProvenance | null {
  const provenance = {
    githubActor: process.env.ACCEPTANCE_GITHUB_ACTOR,
    githubJob: process.env.ACCEPTANCE_GITHUB_JOB,
    githubRunId: process.env.ACCEPTANCE_GITHUB_RUN_ID,
    jobIdentity: process.env.ACCEPTANCE_JOB_IDENTITY,
  }
  return Object.values(provenance).every(isNonemptyString)
    ? provenance as TrustedAcceptanceProvenance
    : null
}

function printUsage(): void {
  process.stderr.write('Usage: runner.ts prepare [root] | collect <artifact-dir> | validate <artifact-dir> | validate-technical <artifact-dir> | accept <artifact-dir> <profile> <method> <evidence> | cleanup <artifact-dir>\n')
}

function main(): void {
  const [command, argument, profileId, method, evidence, holdoutArgument] = process.argv.slice(2)
  if (command === 'prepare') {
    const holdoutProfileIds = holdoutArgument
      ? holdoutArgument.split(',').map(item => item.trim()).filter(Boolean)
      : undefined
    const manifest = prepareRun({ holdoutProfileIds, rootDir: argument })
    process.stdout.write(`${JSON.stringify({ artifactDir: manifest.artifactDir, commands: manifest.commands }, null, 2)}\n`)
    return
  }
  if (command === 'collect' && argument) {
    process.stdout.write(`${JSON.stringify(collectRun({ artifactDir: argument }), null, 2)}\n`)
    return
  }
  if ((command === 'validate' || command === 'validate-technical') && argument) {
    const validation = validateReportAgainstProfiles(
      readJson<RunReport>(path.join(path.resolve(argument), 'report.json')),
      profiles,
      {
        artifactDir: path.resolve(argument),
        expectedAcceptanceProvenance: trustedAcceptanceProvenanceFromEnv(),
        requireIndependentAcceptance: command === 'validate',
      },
    )
    process.stdout.write(`${JSON.stringify(validation, null, 2)}\n`)
    process.exitCode = validation.valid ? 0 : 1
    return
  }
  if (command === 'accept' && argument && profileId && method && evidence) {
    const accepted = recordIndependentAcceptance({
      artifactDir: argument,
      evidence,
      expectedProvenance: trustedAcceptanceProvenanceFromEnv(),
      method: method as RecordAcceptanceOptions['method'],
      profileId,
    })
    process.stdout.write(`${JSON.stringify(accepted, null, 2)}\n`)
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
