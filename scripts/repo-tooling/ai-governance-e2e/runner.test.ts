import type { ProfileReport, RunReport } from './runner.ts'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { deriveGovernanceExpectations, deriveHoldoutFileTypes, holdoutRoutingMatrix } from './holdout-matrix.ts'
import { calibrationProfiles, holdoutProfiles, profiles, runProfiles } from './profiles.ts'
import {
  assertCleanSource,
  cleanupRun,
  collectRun,
  normalizeAcceptanceEvidence,
  parseGitStatusPaths,
  prepareRun,
  recordIndependentAcceptance,
  replayEvidence,
  validateReportAgainstProfiles,
  verifyMutationSensitivity,
} from './runner.ts'
import { parseGovernanceTrace } from './trace.ts'

const fixtureRoot = fileURLToPath(new URL('./__fixtures__/', import.meta.url))
const repositoryTemplate = createRepositoryTemplate()

describe('ai governance profile contract', () => {
  it('keeps the business prompts plus holdout prompts free of governance hints', () => {
    expect(runProfiles.map(profile => [profile.id, profile.prompt])).toEqual([
      ['next-page', '在 apps/client 新增账户设置页面：路由只组合 feature 公开入口，Server Component 获取首屏数据，Client Component 使用现有表单与共享基础控件完成保存交互；补齐必要测试。'],
      ['package-test', '为 packages/http-client 的 BusinessError、createErrorResponse 和 HttpService 增加错误路径、边界与网络隔离测试；在该 package 内补齐 test:run，使 pnpm --filter @kkfive/http-client test:run 可执行。'],
      ['monorepo-config', '为 CI 的 test/build job 持久化 Turbo cache，保持 verify 全量、PR affected 与 push 全量语义，并补充可复现验证。'],
      ['bug-fix', '修复 client 演示导航在无效查询参数下选择不存在菜单项的问题，保持合法导航和键盘操作不变，并补充回归验证。'],
    ])
    expect(holdoutProfiles.map(profile => profile.id)).toEqual(['holdout-client-page', 'holdout-package-test', 'holdout-monorepo-cache', 'holdout-implicit-feature'])
    expect(profiles.some(profile => /\.agents|AGENTS\.md|maestro search|maestro explore|rule|skill|governance/iu.test(profile.prompt))).toBe(false)
  })

  it('keeps the full evidence and regression contract immutable', () => {
    expect(profiles.map(profile => ({
      evidencePaths: profile.evidencePaths,
      evidenceStrategies: profile.evidenceStrategies,
      gates: profile.gates,
      id: profile.id,
      independentAcceptance: profile.independentAcceptance,
      redGate: profile.redGate,
      regressionGates: profile.regressionGates,
    }))).toMatchSnapshot()
  })

  it('derives holdout routing expectations from paths, file types and risk instead of prompt keywords', () => {
    for (const holdout of holdoutRoutingMatrix) {
      const derived = deriveGovernanceExpectations(holdout.routing)
      const profile = holdoutProfiles.find(candidate => candidate.id === holdout.id)
      expect(profile).toBeDefined()
      expect(profile).toMatchObject({
        calibration: false,
        expectedAgentEntries: derived.expectedAgentEntries,
        expectedRules: derived.expectedRules,
        expectedSkills: derived.expectedSkills,
        forbiddenCategories: derived.forbiddenCategories,
        holdout: true,
      })
      expect(deriveHoldoutFileTypes(holdout.routing.targetPaths)).toEqual(holdout.routing.fileTypes)
    }
  })

  it('rejects mismatched declared holdout file types and underreported routing labels', () => {
    expect(() => deriveGovernanceExpectations({
      fileTypes: ['feature'],
      intent: 'feature-delivery',
      targetPaths: ['apps/client/src/app/account/settings/page.tsx'],
    })).toThrow(/HOLDOUT_FILE_TYPES_MISMATCH/u)
  })

  it('keeps the routing oracle, budgets and thresholds immutable', () => {
    expect(runProfiles).toMatchObject([
      {
        allowedPaths: ['apps/client/**'],
        budgetTokens: 1800,
        expectedAgentEntries: ['AGENTS.md', 'apps/client/AGENTS.md'],
        expectedRules: ['feature.rule.md', 'next-app.rule.md', 'testing.rule.md'],
        expectedSkills: ['evidence-first-development', 'nextjs-app-router', 'coding-standards'],
        forbiddenCategories: ['project-architecture', 'styling-system', 'monorepo-engineering'],
        maxForbiddenCategoryHits: 0,
        requiredHitRate: 1,
      },
      {
        allowedPaths: ['packages/http-client/**'],
        budgetTokens: 1200,
        expectedAgentEntries: ['AGENTS.md'],
        expectedRules: ['packages.rule.md', 'testing.rule.md'],
        expectedSkills: ['evidence-first-development', 'coding-standards'],
        forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture', 'monorepo-engineering'],
        maxForbiddenCategoryHits: 0,
        requiredHitRate: 1,
      },
      {
        allowedPaths: ['.github/workflows/ci.yml', 'turbo.json', 'package.json', 'scripts/repo-tooling/**'],
        budgetTokens: 1400,
        expectedAgentEntries: ['AGENTS.md'],
        expectedRules: ['monorepo.rule.md', 'testing.rule.md'],
        expectedSkills: ['evidence-first-development', 'monorepo-engineering', 'coding-standards'],
        forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture'],
        maxForbiddenCategoryHits: 0,
        requiredHitRate: 1,
      },
      {
        allowedPaths: ['apps/client/**'],
        budgetTokens: 1400,
        expectedAgentEntries: ['AGENTS.md', 'apps/client/AGENTS.md'],
        expectedRules: ['feature.rule.md', 'testing.rule.md'],
        expectedSkills: ['evidence-first-development', 'coding-standards'],
        forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture', 'monorepo-engineering'],
        maxForbiddenCategoryHits: 0,
        requiredHitRate: 1,
      },
    ])
  })
})

describe('persisted JSONL read trace', () => {
  it('accepts current tool_use entries without treating file changes as reads', () => {
    const rawLog = [
      JSON.stringify({
        id: 'tool-1',
        input: {},
        name: 'file_change',
        processId: 'process-1',
        result: '',
        status: 'completed',
        timestamp: '2026-07-17T00:00:00.000Z',
        type: 'tool_use',
      }),
      JSON.stringify({
        command: 'cat .agents/rules/feature.rule.md',
        exitCode: 0,
        id: 'command-1',
        output: '',
        processId: 'process-1',
        timestamp: '2026-07-17T00:00:01.000Z',
        type: 'command_exec',
      }),
    ].join('\n')
    const trace = parseGovernanceTrace(rawLog, profiles[0], {
      rawLogPath: '/tmp/current-schema.jsonl',
      readFile: () => 'content',
      rootDir: '/fixture/repository',
    })

    expect(trace.status).toBe('ok')
    expect(trace.errors).toEqual([])
    expect(trace.readTrace.map(read => read.path)).toEqual(['.agents/rules/feature.rule.md'])
  })

  it('canonicalizes macOS private path aliases for absolute governance reads', () => {
    const rawLog = JSON.stringify({
      command: 'cat \'/private/var/folders/project/.agents/skills/coding-standards/SKILL.md\'',
      exitCode: 0,
      id: 'command-1',
      output: '',
      processId: 'process-1',
      timestamp: '2026-07-17T00:00:00.000Z',
      type: 'command_exec',
    })
    const trace = parseGovernanceTrace(rawLog, profiles[1], {
      rawLogPath: '/tmp/private-path.jsonl',
      readFile: () => 'content',
      rootDir: '/var/folders/project',
    })

    expect(trace.readTrace.map(read => read.path)).toEqual(['.agents/skills/coding-standards/SKILL.md'])
  })

  it('deduplicates actual command reads and computes UTF-8 token estimates', () => {
    const trace = parseFixture('duplicate', profiles[0], () => 'abcd')
    expect(trace.status).toBe('ok')
    expect(trace.readTrace).toHaveLength(8)
    expect(trace.rawReadCount).toBe(8)
    expect(trace.uniqueReadCount).toBe(8)
    expect(trace.governanceTokens).toBe(8)
    expect(trace.requiredReadsMissing).toEqual([])
    expect(trace.requiredReadCoverage).toBe(1)
  })

  it('treats missing, malformed and unknown trace schemas as infrastructure errors', () => {
    for (const name of ['missing', 'malformed', 'unknown']) {
      const trace = parseFixture(name, profiles[0], () => 'content')
      expect(trace.status, name).toBe('infrastructure_error')
      expect(trace.errors.length, name).toBeGreaterThan(0)
    }
  })

  it('detects unrelated Skill categories from successful command evidence', () => {
    const trace = parseFixture('unrelated', profiles[1], () => 'content')
    expect(trace.status).toBe('ok')
    expect(trace.requiredReadCoverage).toBe(1)
    expect(trace.unrelatedCategoryReads).toEqual(['styling-system'])
  })

  it('exposes budget excess from the contents of unique files actually read', () => {
    const trace = parseFixture('budget-exceeded', profiles[1], () => 'x'.repeat(6000))
    expect(trace.status).toBe('ok')
    expect(trace.governanceTokens).toBeGreaterThan(profiles[1].budgetTokens)
  })
})

describe.concurrent('prepare, report validation and cleanup', () => {
  it('preserves the first character of tracked porcelain paths', () => {
    expect(parseGitStatusPaths(' M .github/workflows/ci.yml\nM  packages/http-client/package.json\n'))
      .toEqual(['.github/workflows/ci.yml', 'packages/http-client/package.json'])
  })

  it('refuses a dirty source worktree', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-dirty-'))
    try {
      const repository = createRepository(temporaryRoot)
      expect(() => assertCleanSource(repository)).not.toThrow()
      fs.appendFileSync(path.join(repository, 'README.md'), 'dirty\n')
      expect(() => assertCleanSource(repository)).toThrow(/DIRTY_SOURCE/u)
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('creates detached run-owned worktrees and removes only those resources', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-worktrees-'))
    try {
      const repository = createRepository(temporaryRoot)
      const cliToolsPath = path.join(temporaryRoot, 'cli-tools.json')
      fs.writeFileSync(cliToolsPath, JSON.stringify({
        tools: { codex: { enabled: true, primaryModel: 'gpt-test', tags: ['backend'], type: 'builtin' } },
        version: 'test-version',
      }))
      const manifest = prepareRun({
        artifactRoot: path.join(temporaryRoot, 'artifacts'),
        cliToolsPath,
        rootDir: repository,
        runId: 'fixture-run',
        worktreeRoot: path.join(temporaryRoot, 'worktrees', 'fixture-run'),
      })

      expect(manifest.commands).toHaveLength(runProfiles.length)
      expect(new Set(manifest.commands.map(command => command.executionId)).size).toBe(runProfiles.length)
      expect(manifest.commands.every(command => command.runInBackground)).toBe(true)
      expect(manifest.commands.every(command => command.command.includes('--to codex --mode write'))).toBe(true)
      expect(manifest.ownedWorktrees.every(worktree => fs.existsSync(worktree))).toBe(true)

      cleanupRun(manifest.artifactDir)
      expect(manifest.ownedWorktrees.every(worktree => !fs.existsSync(worktree))).toBe(true)
      expect(fs.existsSync(path.join(manifest.artifactDir, 'cleanup.json'))).toBe(true)
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('replays evidence on the committed baseline and distinguishes valid RED from an unexpected pass', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-evidence-'))
    try {
      const repository = createRepository(temporaryRoot)
      fs.writeFileSync(path.join(repository, 'behavior.test.js'), [
        'const fs = require("node:fs")',
        'if (!fs.existsSync("implementation.txt")) {',
        '  console.error("TARGET_BEHAVIOR_MISSING")',
        '  process.exit(7)',
        '}',
      ].join('\n'))
      fs.writeFileSync(path.join(repository, 'implementation.txt'), 'implemented\n')

      const valid = replayEvidence({
        evidencePaths: ['behavior.test.js'],
        profileId: 'fixture',
        redGate: { command: 'node behavior.test.js', expectedExitCode: 7, failurePattern: 'TARGET_BEHAVIOR_MISSING', forbiddenFailurePatterns: ['Cannot find module'] },
        sourceHead: gitText(repository, ['rev-parse', 'HEAD']),
        worktree: repository,
        worktreeRoot: path.join(temporaryRoot, 'replay'),
      })
      expect(valid).toMatchObject({ error: null, exitCode: 7, passed: true, patchFiles: ['behavior.test.js'] })

      fs.mkdirSync(path.join(repository, 'src'), { recursive: true })
      fs.writeFileSync(path.join(repository, 'src', 'nested.test.ts'), 'throw new Error("nested")\n')
      const nested = replayEvidence({
        evidencePaths: ['src/**/*.test.ts'],
        profileId: 'fixture-nested',
        redGate: { command: 'node -e "console.error(\'TARGET_BEHAVIOR_MISSING\'); process.exit(1)"', expectedExitCode: 1, failurePattern: 'TARGET_BEHAVIOR_MISSING', forbiddenFailurePatterns: ['Cannot find module'] },
        sourceHead: gitText(repository, ['rev-parse', 'HEAD']),
        worktree: repository,
        worktreeRoot: path.join(temporaryRoot, 'replay-nested'),
      })
      expect(nested).toMatchObject({ error: null, passed: true, patchFiles: ['src/nested.test.ts'] })

      const unexpectedPass = replayEvidence({
        evidencePaths: ['behavior.test.js'],
        profileId: 'fixture-pass',
        redGate: { command: 'node -e "process.exit(0)"', expectedExitCode: 7, failurePattern: 'TARGET_BEHAVIOR_MISSING', forbiddenFailurePatterns: ['Cannot find module'] },
        sourceHead: gitText(repository, ['rev-parse', 'HEAD']),
        worktree: repository,
        worktreeRoot: path.join(temporaryRoot, 'replay-pass'),
      })
      expect(unexpectedPass).toMatchObject({ error: 'red_unexpected_pass', exitCode: 0, passed: false })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects missing or production evidence without executing RED', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-invalid-evidence-'))
    try {
      const repository = createRepository(temporaryRoot)
      fs.writeFileSync(path.join(repository, 'implementation.txt'), 'production\n')
      const common = {
        profileId: 'fixture',
        redGate: { command: 'node -e "console.error(\'TARGET_BEHAVIOR_MISSING\'); process.exit(1)"', expectedExitCode: 1, failurePattern: 'TARGET_BEHAVIOR_MISSING', forbiddenFailurePatterns: ['Cannot find module'] },
        sourceHead: gitText(repository, ['rev-parse', 'HEAD']),
        worktree: repository,
      }
      expect(replayEvidence({ ...common, evidencePaths: ['missing.test.js'], worktreeRoot: path.join(temporaryRoot, 'missing') }))
        .toMatchObject({ error: 'missing_evidence_patch', passed: false })
      expect(replayEvidence({ ...common, evidencePaths: ['implementation.txt'], worktreeRoot: path.join(temporaryRoot, 'production') }))
        .toMatchObject({ error: 'production_file_in_evidence_patch', passed: false })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects generic RED failure text that is unrelated to the target behavior', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-broad-red-'))
    try {
      const repository = createRepository(temporaryRoot)
      fs.writeFileSync(path.join(repository, 'behavior.test.js'), 'test evidence\n')

      const replay = replayEvidence({
        evidencePaths: ['behavior.test.js'],
        profileId: 'fixture-generic-failure',
        redGate: {
          command: 'node -e "console.error(\'FAIL unrelated assertion\'); process.exit(1)"',
          expectedExitCode: 1,
          failurePattern: 'TARGET_BEHAVIOR_MISSING',
          forbiddenFailurePatterns: [],
        },
        sourceHead: gitText(repository, ['rev-parse', 'HEAD']),
        worktree: repository,
        worktreeRoot: path.join(temporaryRoot, 'replay'),
      })

      expect(replay).toMatchObject({ error: 'red_failure_mismatch', passed: false })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('requires every read group instead of allowing diluted aggregate coverage', () => {
    const rawLog = [
      'cat AGENTS.md',
      'cat apps/client/AGENTS.md',
      'cat .agents/rules/feature.rule.md',
      'cat .agents/rules/next-app.rule.md',
    ].map((command, index) => JSON.stringify({
      command,
      exitCode: 0,
      id: `command-${index + 1}`,
      output: '',
      processId: 'process-1',
      timestamp: `2026-07-17T00:00:0${index}.000Z`,
      type: 'command_exec',
    })).join('\n')
    const trace = parseGovernanceTrace(rawLog, profiles[0]!, {
      rawLogPath: '/tmp/grouped-coverage.jsonl',
      readFile: () => 'content',
      rootDir: '/fixture/repository',
    })
    expect(trace.requiredReadCoverage).toBeLessThan(1)
    expect(trace.requiredReadsMissing).toEqual(expect.arrayContaining([
      'rule:testing.rule.md',
      'skill:evidence-first-development',
      'skill:nextjs-app-router',
      'skill:coding-standards',
    ]))
    expect(trace.requiredReadGroups.map(group => ({ id: group.id, satisfied: group.satisfied }))).toEqual([
      { id: 'entries', satisfied: true },
      { id: 'rules', satisfied: false },
      { id: 'skills', satisfied: false },
    ])
  })

  it('enforces the holdout routing matrix even when prompts never mention constraints explicitly', () => {
    for (const holdout of holdoutProfiles) {
      const reads = [
        ...holdout.expectedAgentEntries.map(entry => `cat ${entry}`),
        ...holdout.expectedRules.map(rule => `cat .agents/rules/${rule}`),
        ...holdout.expectedSkills.map(skill => `cat .agents/skills/${skill}/SKILL.md`),
      ]
      const rawLog = reads.map((command, index) => JSON.stringify({
        command,
        exitCode: 0,
        id: `${holdout.id}-command-${index + 1}`,
        output: '',
        processId: holdout.id,
        timestamp: `2026-07-17T00:00:${String(index).padStart(2, '0')}.000Z`,
        type: 'command_exec',
      })).join('\n')
      const trace = parseGovernanceTrace(rawLog, holdout, {
        rawLogPath: `/tmp/${holdout.id}.jsonl`,
        readFile: () => 'content',
        rootDir: '/fixture/repository',
      })
      expect(trace.requiredReadCoverage).toBe(1)
      expect(trace.requiredReadGroups.every(group => group.satisfied)).toBe(true)
      expect(trace.unrelatedCategoryReads).toEqual([])
    }
  })

  it('fails each holdout when a required entry, rule or skill group is omitted', () => {
    for (const holdout of holdoutProfiles) {
      const completeReads = [
        ...holdout.expectedAgentEntries.map(entry => `cat ${entry}`),
        ...holdout.expectedRules.map(rule => `cat .agents/rules/${rule}`),
        ...holdout.expectedSkills.map(skill => `cat .agents/skills/${skill}/SKILL.md`),
      ]
      const groupExpectations = [
        { id: 'entries', remove: holdout.expectedAgentEntries.map(entry => `cat ${entry}`) },
        { id: 'rules', remove: holdout.expectedRules.map(rule => `cat .agents/rules/${rule}`) },
        { id: 'skills', remove: holdout.expectedSkills.map(skill => `cat .agents/skills/${skill}/SKILL.md`) },
      ].filter(group => group.remove.length > 0)

      for (const group of groupExpectations) {
        const rawLog = completeReads
          .filter(command => !group.remove.includes(command))
          .map((command, index) => JSON.stringify({
            command,
            exitCode: 0,
            id: `${holdout.id}-${group.id}-${index + 1}`,
            output: '',
            processId: `${holdout.id}-${group.id}`,
            timestamp: `2026-07-17T00:01:${String(index).padStart(2, '0')}.000Z`,
            type: 'command_exec',
          }))
          .join('\n')
        const trace = parseGovernanceTrace(rawLog, holdout, {
          rawLogPath: `/tmp/${holdout.id}-${group.id}.jsonl`,
          readFile: () => 'content',
          rootDir: '/fixture/repository',
        })
        expect(trace.requiredReadCoverage).toBeLessThan(1)
        expect(trace.requiredReadGroups.find(candidate => candidate.id === group.id)?.satisfied).toBe(false)
      }
    }
  })

  it('fails holdout traces that read forbidden categories even when all required groups are present', () => {
    for (const holdout of holdoutProfiles) {
      if (holdout.forbiddenCategories.length === 0)
        continue
      const forbidden = holdout.forbiddenCategories[0]!
      const reads = [
        ...holdout.expectedAgentEntries.map(entry => `cat ${entry}`),
        ...holdout.expectedRules.map(rule => `cat .agents/rules/${rule}`),
        ...holdout.expectedSkills.map(skill => `cat .agents/skills/${skill}/SKILL.md`),
        `cat .agents/skills/${forbidden}/SKILL.md`,
      ]
      const rawLog = reads.map((command, index) => JSON.stringify({
        command,
        exitCode: 0,
        id: `${holdout.id}-forbidden-${index + 1}`,
        output: '',
        processId: `${holdout.id}-forbidden`,
        timestamp: `2026-07-17T00:02:${String(index).padStart(2, '0')}.000Z`,
        type: 'command_exec',
      })).join('\n')
      const trace = parseGovernanceTrace(rawLog, holdout, {
        rawLogPath: `/tmp/${holdout.id}-forbidden.jsonl`,
        readFile: () => 'content',
        rootDir: '/fixture/repository',
      })
      expect(trace.requiredReadCoverage).toBe(1)
      expect(trace.unrelatedCategoryReads).toContain(forbidden)
    }
  })

  it('excludes holdouts from default prepared runs but can prepare a selected holdout set separately', () => {
    expect(runProfiles.map(profile => profile.id)).toEqual(['next-page', 'package-test', 'monorepo-config', 'bug-fix'])
    expect(holdoutProfiles.map(profile => profile.id)).toEqual(['holdout-client-page', 'holdout-package-test', 'holdout-monorepo-cache', 'holdout-implicit-feature'])
    expect(calibrationProfiles.every(profile => profile.holdout !== true)).toBe(true)

    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-holdout-prepare-'))
    try {
      const repository = createRepository(temporaryRoot)
      const cliToolsPath = createCliToolsFixture(temporaryRoot)
      const manifest = prepareRun({
        artifactRoot: path.join(temporaryRoot, 'artifacts'),
        cliToolsPath,
        holdoutProfileIds: ['holdout-package-test', 'holdout-implicit-feature'],
        rootDir: repository,
        runId: 'holdout-fixture-run',
        worktreeRoot: path.join(temporaryRoot, 'worktrees', 'holdout-fixture-run'),
      })
      expect(manifest.commands.map(command => command.profileId)).toEqual(['holdout-package-test', 'holdout-implicit-feature'])
      expect(manifest.commands).toHaveLength(2)
      cleanupRun(manifest.artifactDir)
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('fails package mutation sensitivity when the suite does not detect a seeded mutation', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-mutation-'))
    try {
      const repository = createRepository(temporaryRoot)
      fs.mkdirSync(path.join(repository, 'packages', 'http-client', 'src'), { recursive: true })
      fs.writeFileSync(path.join(repository, 'packages', 'http-client', 'src', 'error.ts'), 'export class BusinessError {\n  constructor(_message, _options) {\n    this.code = _options?.code\n  }\n}\n')
      runGit(repository, ['add', 'packages/http-client/src/error.ts'])
      runGit(repository, ['commit', '--no-verify', '-m', 'add mutation target'])
      const mutation = verifyMutationSensitivity({
        profile: profiles[1]!,
        sourceHead: gitText(repository, ['rev-parse', 'HEAD']),
        worktree: repository,
        worktreeRoot: path.join(temporaryRoot, 'mutation-check'),
      })
      expect(mutation).toMatchObject({ error: 'mutation_not_sensitive', passed: false })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects the low aggregate coverage contract when required read groups are absent', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-low-coverage-'))
    try {
      const { artifactDir, profile } = createValidationArtifact(temporaryRoot, profiles[1]!)
      const rawLogPath = path.join(artifactDir, `${profile.id}-raw.jsonl`)
      const partialRawLog = [
        'cat AGENTS.md',
        'cat .agents/rules/packages.rule.md',
      ].map((command, index) => JSON.stringify({
        command,
        exitCode: 0,
        id: `command-${index + 1}`,
        output: '',
        processId: 'process-1',
        timestamp: `2026-07-17T00:00:0${index}.000Z`,
        type: 'command_exec',
      })).join('\n')
      fs.writeFileSync(rawLogPath, `${partialRawLog}\n`)
      const reportPath = path.join(artifactDir, 'report.json')
      const report = readJsonFile<RunReport>(reportPath)
      report.profiles[0]!.required_read_coverage = profile.requiredHitRate
      writeJsonFile(reportPath, report)

      expect(validateReportAgainstProfiles(readJsonFile<RunReport>(reportPath), [profile], { artifactDir })).toMatchObject({
        issues: expect.arrayContaining([`${profile.id}:raw_log_hash_mismatch`, `${profile.id}:required_read_coverage_tampered`, `${profile.id}:read_trace_tampered`]),
        valid: false,
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects live execution when manifest worktree escapes the owned run root', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-worktree-escape-'))
    try {
      const { artifactDir, profile } = createValidationArtifact(temporaryRoot)
      const outsideRepo = createRepository(path.join(temporaryRoot, 'outside'))
      const manifestPath = path.join(artifactDir, 'manifest.json')
      const manifest = readJsonFile<Record<string, unknown>>(manifestPath)
      const commands = manifest.commands as Array<Record<string, unknown>>
      commands[0] = { ...commands[0]!, worktree: outsideRepo }
      writeJsonFile(manifestPath, manifest)
      expect(validateReportAgainstProfiles(readJsonFile<RunReport>(path.join(artifactDir, 'report.json')), [profile], { artifactDir })).toMatchObject({
        issues: expect.arrayContaining(['manifest_hash_mismatch', `${profile.id}:worktree_not_run_owned`]),
        valid: false,
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('persists and validates mutation artifacts for mutation strategies', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-mutation-artifact-'))
    try {
      const { artifactDir, profile } = createValidationArtifact(temporaryRoot, profiles[1]!)
      const mutationPath = path.join(artifactDir, `${profile.id}-mutation.json`)
      expect(fs.existsSync(mutationPath)).toBe(true)
      const report = readJsonFile<RunReport>(path.join(artifactDir, 'report.json'))
      expect(report.profiles[0]!.mutation_result).toMatchObject({ passed: true })
      const validation = validateReportAgainstProfiles(report, [profile], { artifactDir, requireIndependentAcceptance: false })
      expect(validation.issues).not.toContain(`${profile.id}:missing_mutation_result`)
      expect(validation.issues).not.toContain(`${profile.id}:mutation_artifact_missing`)
      expect(validation.issues).not.toContain(`${profile.id}:mutation_hash_mismatch`)
      expect(validation.issues).not.toContain(`${profile.id}:mutation_report_tampered`)
      writeJsonFile(mutationPath, { error: 'mutation_not_sensitive', output: 'tampered', passed: false })
      expect(validateReportAgainstProfiles(readJsonFile<RunReport>(path.join(artifactDir, 'report.json')), [profile], { artifactDir })).toMatchObject({
        issues: expect.arrayContaining([`${profile.id}:mutation_hash_mismatch`, `${profile.id}:mutation_report_tampered`]),
        valid: false,
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('downgrades mutation validation to evidence_only after worktree cleanup but still validates mutation artifact hashes', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-mutation-evidence-only-'))
    try {
      const { artifactDir, profile, worktree } = createValidationArtifact(temporaryRoot, profiles[1]!)
      fs.rmSync(worktree, { force: true, recursive: true })
      const validation = validateReportAgainstProfiles(readJsonFile<RunReport>(path.join(artifactDir, 'report.json')), [profile], { artifactDir, requireIndependentAcceptance: false })
      expect(validation).toMatchObject({
        assurance: 'evidence_only',
      })
      expect(validation.issues).not.toContain(`${profile.id}:missing_mutation_result`)
      expect(validation.issues).not.toContain(`${profile.id}:mutation_artifact_missing`)
      expect(validation.issues).not.toContain(`${profile.id}:mutation_hash_mismatch`)
      expect(validation.issues).not.toContain(`${profile.id}:mutation_report_tampered`)
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects a tampered manifest even when the report still looks valid', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-manifest-tamper-'))
    try {
      const { artifactDir, profile } = createValidationArtifact(temporaryRoot)
      const manifestPath = path.join(artifactDir, 'manifest.json')
      const manifest = readJsonFile<Record<string, unknown>>(manifestPath)
      manifest.runId = 'other-run'
      writeJsonFile(manifestPath, manifest)
      expect(validateReportAgainstProfiles(readJsonFile<RunReport>(path.join(artifactDir, 'report.json')), [profile], { artifactDir })).toMatchObject({
        issues: expect.arrayContaining(['manifest_hash_mismatch', 'run_id_mismatch']),
        valid: false,
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects a tampered raw log artifact', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-raw-log-tamper-'))
    try {
      const { artifactDir, profile } = createValidationArtifact(temporaryRoot)
      fs.writeFileSync(path.join(artifactDir, `${profile.id}-raw.jsonl`), `${JSON.stringify({ type: 'command_exec', command: 'cat AGENTS.md', exitCode: 0 })}
`)
      expect(validateReportAgainstProfiles(readJsonFile<RunReport>(path.join(artifactDir, 'report.json')), [profile], { artifactDir })).toMatchObject({
        issues: expect.arrayContaining([`${profile.id}:raw_log_hash_mismatch`, `${profile.id}:required_read_coverage_tampered`]),
        valid: false,
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects tampered gate, diff and report hashes from the artifact chain', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-hash-tamper-'))
    try {
      const { artifactDir, profile } = createValidationArtifact(temporaryRoot)
      const reportPath = path.join(artifactDir, 'report.json')
      const report = readJsonFile<RunReport>(reportPath)
      report.profiles[0]!.commands.gates[0]!.passed = false
      writeJsonFile(reportPath, report)
      const integrityPath = path.join(artifactDir, 'integrity.json')
      const integrity = readJsonFile<Record<string, unknown>>(integrityPath)
      const profileIntegrity = (integrity.profiles as Record<string, Record<string, unknown>>)[profile.id]!
      profileIntegrity.gateHash = '0'.repeat(64)
      profileIntegrity.finalDiffRecordHash = '1'.repeat(64)
      profileIntegrity.reportHash = '2'.repeat(64)
      writeJsonFile(integrityPath, integrity)
      expect(validateReportAgainstProfiles(readJsonFile<RunReport>(reportPath), [profile], { artifactDir })).toMatchObject({
        issues: expect.arrayContaining([`${profile.id}:gate_hash_mismatch`, `${profile.id}:final_diff_record_hash_mismatch`, `${profile.id}:report_hash_mismatch`]),
        valid: false,
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('downgrades assurance to evidence_only after worktree cleanup when artifact evidence remains self-contained', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-evidence-only-'))
    try {
      const { artifactDir, profile, worktree } = createValidationArtifact(temporaryRoot)
      fs.rmSync(worktree, { force: true, recursive: true })
      expect(validateReportAgainstProfiles(readJsonFile<RunReport>(path.join(artifactDir, 'report.json')), [profile], { artifactDir })).toMatchObject({
        assurance: 'evidence_only',
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('rejects acceptance evidence self-attested by the implementation execution', () => {
    const fixture = createAcceptanceFixture({
      method: 'browser',
      payload: createBrowserPayload(),
      provenance: { actor: 'local-reviewer', level: 'locally_attested' },
      verifier: 'cdx-next-page',
    })
    try {
      expect(() => recordIndependentAcceptance({
        artifactDir: fixture.artifactDir,
        evidence: fixture.evidenceFile,
        method: fixture.profile.independentAcceptance,
        profileId: fixture.profile.id,
      })).toThrow(/ACCEPTANCE_EVIDENCE_NOT_INDEPENDENT/u)
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('rejects schema-free browser acceptance evidence with an empty observation payload', () => {
    const fixture = createAcceptanceFixture({
      method: 'browser',
      payload: {},
      provenance: { actor: 'separate-reviewer', level: 'locally_attested' },
      verifier: 'separate-reviewer',
    })
    try {
      expect(() => recordIndependentAcceptance({
        artifactDir: fixture.artifactDir,
        evidence: fixture.evidenceFile,
        method: fixture.profile.independentAcceptance,
        profileId: fixture.profile.id,
      })).toThrow(/ACCEPTANCE_BROWSER_EVIDENCE_REQUIRED/u)
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('rejects stale acceptance evidence even when its run binding hash is correct', () => {
    const fixture = createAcceptanceFixture({
      generatedAt: '2020-01-01T00:00:00.000Z',
      method: 'browser',
      payload: createBrowserPayload(),
      provenance: { actor: 'separate-reviewer', level: 'locally_attested' },
      verifier: 'separate-reviewer',
    })
    try {
      expect(() => recordIndependentAcceptance({
        artifactDir: fixture.artifactDir,
        evidence: fixture.evidenceFile,
        method: fixture.profile.independentAcceptance,
        profileId: fixture.profile.id,
      })).toThrow(/ACCEPTANCE_EVIDENCE_STALE/u)
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('rejects a browser method without browser-specific observations', () => {
    const fixture = createAcceptanceFixture({
      method: 'browser',
      payload: { checklist: [] },
      provenance: { actor: 'separate-reviewer', level: 'locally_attested' },
      verifier: 'separate-reviewer',
    })
    try {
      expect(() => recordIndependentAcceptance({
        artifactDir: fixture.artifactDir,
        evidence: fixture.evidenceFile,
        method: fixture.profile.independentAcceptance,
        profileId: fixture.profile.id,
      })).toThrow(/ACCEPTANCE_BROWSER_EVIDENCE_REQUIRED/u)
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('records locally attested browser evidence without upgrading to an independent pass', () => {
    const fixture = createAcceptanceFixture({
      method: 'browser',
      payload: createBrowserPayload(),
      provenance: { actor: 'local-reviewer', level: 'locally_attested' },
      verifier: 'separate-reviewer',
    })
    try {
      const report = recordIndependentAcceptance({
        artifactDir: fixture.artifactDir,
        evidence: fixture.evidenceFile,
        method: fixture.profile.independentAcceptance,
        profileId: fixture.profile.id,
      })
      const item = report.profiles.find(candidate => candidate.profile === fixture.profile.id)!
      expect(item.independent_acceptance.status).toBe('locally_attested')
      expect(item.verdict).toBe('acceptance_pending')
      expect(validateReportAgainstProfiles(report, [fixture.profile], { artifactDir: fixture.artifactDir, requireIndependentAcceptance: false })).toMatchObject({ valid: true })
      expect(validateReportAgainstProfiles(report, [fixture.profile], { artifactDir: fixture.artifactDir })).toMatchObject({ valid: false })
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('accepts independently verified API evidence schema with full provenance', () => {
    const fixture = createAcceptanceFixture({
      method: 'api',
      payload: createApiPayload(),
      profile: profiles[1]!,
      provenance: {
        actor: 'api-reviewer',
        githubActor: 'ci-bot',
        githubJob: 'independent-acceptance',
        githubRunId: '12345',
        jobIdentity: 'github-actions://independent-acceptance/12345',
        level: 'independently_verified',
      },
      verifier: 'independent-api-reviewer',
    })
    try {
      const evidence = readJsonFile<any>(fixture.evidenceFile)
      expect(normalizeAcceptanceEvidence({
        artifactDir: fixture.artifactDir,
        evidence,
        evidenceFile: fixture.evidenceFile,
        executionId: 'cdx-fixture',
        expectedProvenance: {
          githubActor: 'ci-bot',
          githubJob: 'independent-acceptance',
          githubRunId: '12345',
          jobIdentity: 'github-actions://independent-acceptance/12345',
        },
        method: 'api',
        reportGeneratedAt: '2026-07-16T00:00:00.000Z',
      }).provenance.level).toBe('independently_verified')
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('accepts independently verified reviewer evidence with checklist and findings', () => {
    const fixture = createAcceptanceFixture({
      method: 'reviewer',
      payload: createReviewerPayload(),
      profile: profiles[2]!,
      provenance: {
        actor: 'human-reviewer',
        githubActor: 'ci-bot',
        githubJob: 'review-acceptance',
        githubRunId: '98765',
        jobIdentity: 'github-actions://review-acceptance/98765',
        level: 'independently_verified',
      },
      verifier: 'independent-reviewer',
    })
    try {
      const report = recordIndependentAcceptance({
        artifactDir: fixture.artifactDir,
        evidence: fixture.evidenceFile,
        expectedProvenance: {
          githubActor: 'ci-bot',
          githubJob: 'review-acceptance',
          githubRunId: '98765',
          jobIdentity: 'github-actions://review-acceptance/98765',
        },
        method: fixture.profile.independentAcceptance,
        profileId: fixture.profile.id,
      })
      expect(validateReportAgainstProfiles(report, [fixture.profile], {
        artifactDir: fixture.artifactDir,
        expectedAcceptanceProvenance: {
          githubActor: 'ci-bot',
          githubJob: 'review-acceptance',
          githubRunId: '98765',
          jobIdentity: 'github-actions://review-acceptance/98765',
        },
      })).toMatchObject({ valid: true })
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('rejects independently verified API evidence without CI provenance fields', () => {
    const fixture = createAcceptanceFixture({
      method: 'api',
      payload: createApiPayload(),
      profile: profiles[1]!,
      provenance: { actor: 'api-reviewer', level: 'independently_verified' } as never,
      verifier: 'independent-api-reviewer',
    })
    try {
      const evidence = readJsonFile<any>(fixture.evidenceFile)
      expect(() => normalizeAcceptanceEvidence({
        artifactDir: fixture.artifactDir,
        evidence,
        evidenceFile: fixture.evidenceFile,
        executionId: 'cdx-fixture',
        method: 'api',
        reportGeneratedAt: '2026-07-16T00:00:00.000Z',
      })).toThrow(/ACCEPTANCE_INDEPENDENT_PROVENANCE_REQUIRED/u)
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('rejects API evidence without request and response attachments', () => {
    const fixture = createAcceptanceFixture({
      attachments: [{ kind: 'review-artifact', name: 'review.txt', text: 'missing request response' }],
      method: 'api',
      payload: createApiPayload(),
      profile: profiles[1]!,
      provenance: { actor: 'api-reviewer', level: 'locally_attested' },
      verifier: 'independent-api-reviewer',
    })
    try {
      const evidence = readJsonFile<any>(fixture.evidenceFile)
      expect(() => normalizeAcceptanceEvidence({
        artifactDir: fixture.artifactDir,
        evidence,
        evidenceFile: fixture.evidenceFile,
        executionId: 'cdx-fixture',
        method: 'api',
        reportGeneratedAt: '2026-07-16T00:00:00.000Z',
      })).toThrow(/ACCEPTANCE_API_EVIDENCE_REQUIRED/u)
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('rejects reviewer evidence whose execution identity matches the implementation execution', () => {
    const fixture = createAcceptanceFixture({
      method: 'reviewer',
      payload: createReviewerPayload({ executionIdentity: 'cdx-monorepo-config' }),
      profile: profiles[2]!,
      provenance: { actor: 'reviewer', level: 'locally_attested' },
      verifier: 'independent-reviewer',
    })
    try {
      expect(() => recordIndependentAcceptance({
        artifactDir: fixture.artifactDir,
        evidence: fixture.evidenceFile,
        method: fixture.profile.independentAcceptance,
        profileId: fixture.profile.id,
      })).toThrow(/ACCEPTANCE_REVIEWER_EVIDENCE_REQUIRED/u)
    }
    finally {
      fs.rmSync(fixture.root, { force: true, recursive: true })
    }
  })

  it('rejects an allowed-path violation created by a command gate after the pre-gate diff snapshot', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-gate-diff-'))
    try {
      const repository = createRepository(temporaryRoot)
      const runId = 'fixture-run'
      const artifactRoot = path.join(temporaryRoot, 'artifacts')
      const cliToolsPath = createCliToolsFixture(temporaryRoot)
      const manifest = prepareRun({
        artifactRoot,
        cliToolsPath,
        rootDir: repository,
        runId,
        worktreeRoot: path.join(temporaryRoot, 'worktrees', runId),
      })
      const profile = profiles[1]!
      const prepared = manifest.commands.find(command => command.profileId === profile.id)!
      const historyDir = path.join(temporaryRoot, 'history')
      fs.mkdirSync(historyDir, { recursive: true })
      const rawLog = [
        'cat AGENTS.md',
        'cat .agents/rules/packages.rule.md',
        'cat .agents/rules/testing.rule.md',
        'cat .agents/skills/evidence-first-development/SKILL.md',
        'cat .agents/skills/coding-standards/SKILL.md',
      ].map((command, index) => JSON.stringify({
        command,
        exitCode: 0,
        id: `command-${index + 1}`,
        output: '',
        processId: 'process-1',
        timestamp: `2026-07-17T00:00:0${index}.000Z`,
        type: 'command_exec',
      })).join('\n')
      fs.writeFileSync(path.join(historyDir, `${prepared.executionId}.jsonl`), `${rawLog}\n`)
      const evidenceFile = path.join(prepared.worktree, 'packages', 'http-client', 'src', 'error.test.ts')
      fs.mkdirSync(path.dirname(evidenceFile), { recursive: true })
      fs.writeFileSync(evidenceFile, 'evidence\n')

      const report = collectRun({
        artifactDir: manifest.artifactDir,
        historyDir,
        replayEvidence: () => ({
          command: profile.redGate!.command,
          error: null,
          exitCode: profile.redGate!.expectedExitCode,
          output: profile.redGate!.failurePattern,
          passed: true,
          patchFiles: ['packages/http-client/src/error.test.ts'],
          patchPath: null,
        }),
        runGate: (gate, worktree) => {
          fs.writeFileSync(path.join(worktree, 'README.md'), 'outside allowed path\n')
          return {
            command: gate.kind === 'command' ? gate.command : gate.assertion,
            exitCode: gate.kind === 'command' ? 0 : null,
            kind: gate.kind,
            output: '',
            passed: true,
          }
        },
      })
      const profileReport = report.profiles.find(item => item.profile === profile.id)!
      expect(profileReport.diff_files).toContain('README.md')
      expect(profileReport.verdict).toBe('failed')
      expect(validateReportAgainstProfiles(report, [profile])).toMatchObject({
        issues: expect.arrayContaining([`${profile.id}:diff_outside_allowed_paths`, `${profile.id}:verdict_failed`]),
        valid: false,
      })
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  }, 60000)

  it('rejects forged RED output and failed final gates even when verdict says passed', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-forged-red-'))
    try {
      const { artifactDir, profile } = createValidationArtifact(temporaryRoot)
      const reportPath = path.join(artifactDir, 'report.json')
      const report = readJsonFile<RunReport>(reportPath)
      report.profiles[0]!.evidence_replay = { ...report.profiles[0]!.evidence_replay!, output: 'unrelated infrastructure failure' }
      report.profiles[0]!.commands.gates[0] = { ...report.profiles[0]!.commands.gates[0]!, passed: false }
      writeJsonFile(reportPath, report)
      const validation = validateReportAgainstProfiles(readJsonFile<RunReport>(reportPath), [profile], { artifactDir })
      expect(validation.valid).toBe(false)
      expect(validation.issues).toEqual(expect.arrayContaining([
        `${profile.id}:red_failure_pattern_mismatch`,
        `${profile.id}:failed_gate:${report.profiles[0]!.commands.gates[0]!.command}`,
      ]))
    }
    finally {
      fs.rmSync(temporaryRoot, { force: true, recursive: true })
    }
  })

  it('allows technical validation to stop at acceptance pending without claiming a final pass', () => {
    const reports = profiles.map(profile => ({
      ...createPassingReport(profile),
      acceptance_evidence: null,
      acceptance_evidence_metadata: null,
      independent_acceptance: { method: profile.independentAcceptance, status: 'pending' as const },
      verdict: 'acceptance_pending' as const,
    }))

    expect(validateReportAgainstProfiles(reports, profiles, { requireIndependentAcceptance: false }))
      .toMatchObject({ issues: [], valid: true })
    expect(validateReportAgainstProfiles(reports, profiles))
      .toMatchObject({ valid: false })
  })

  it('validates reports dynamically against imported profiles instead of trusting the verdict', () => {
    const reports = profiles.map(profile => createPassingReport(profile))
    expect(validateReportAgainstProfiles(reports, profiles)).toMatchObject({ issues: [], valid: true })
    reports[0] = { ...reports[0]!, evidence_replay: null }
    expect(validateReportAgainstProfiles(reports, profiles)).toMatchObject({ valid: false })
  })
})

function parseFixture(
  name: string,
  profile: typeof profiles[number],
  readFile: (file: string) => string,
) {
  const rawLogPath = path.join(fixtureRoot, `${name}.jsonl`)
  return parseGovernanceTrace(fs.readFileSync(rawLogPath, 'utf8'), profile, {
    rawLogPath,
    readFile,
    rootDir: '/fixture/repository',
  })
}

function createAcceptanceFixture(options: {
  attachments?: Array<{ kind: string, name: string, text: string }>
  generatedAt?: string
  method: 'api' | 'browser' | 'reviewer'
  payload: unknown
  profile?: typeof profiles[number]
  provenance: Record<string, unknown>
  verifier: string
}): {
  artifactDir: string
  evidenceFile: string
  profile: typeof profiles[number]
  root: string
} {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-acceptance-'))
  const artifactDir = path.join(root, 'artifact')
  fs.mkdirSync(artifactDir, { recursive: true })
  const profile = options.profile ?? profiles[0]!
  const report = createPassingReport(profile)
  report.execution_id = `cdx-${profile.id}`
  report.independent_acceptance = { method: profile.independentAcceptance, status: 'pending' }
  report.verdict = 'acceptance_pending'
  const attachments = (options.attachments ?? defaultAcceptanceAttachments(options.method)).map((attachment) => {
    const file = path.join(artifactDir, attachment.name)
    fs.writeFileSync(file, attachment.text)
    return {
      kind: attachment.kind,
      path: attachment.name,
      sha256: createHash('sha256').update(attachment.text).digest('hex'),
    }
  })
  const evidence = {
    attachments,
    diffHash: report.diff_hash,
    evidenceHash: '',
    generatedAt: options.generatedAt ?? '2026-07-16T01:00:00.000Z',
    method: options.method,
    payload: options.payload,
    provenance: options.provenance,
    result: 'passed',
    runId: report.run_id,
    sourceHead: report.source_head,
    verifier: options.verifier,
  }
  evidence.evidenceHash = createHash('sha256').update(JSON.stringify({
    attachments: evidence.attachments,
    method: evidence.method,
    payload: evidence.payload,
    provenance: evidence.provenance,
  })).digest('hex')
  const evidenceFile = path.join(artifactDir, 'acceptance-evidence.json')
  fs.writeFileSync(evidenceFile, `${JSON.stringify(evidence)}
`)
  fs.writeFileSync(path.join(artifactDir, 'report.json'), `${JSON.stringify({
    generated_at: '2026-07-16T00:00:00.000Z',
    profiles: [report],
    run_id: report.run_id,
    source_head: report.source_head,
  })}
`)
  return { artifactDir, evidenceFile, profile, root }
}

function defaultAcceptanceAttachments(method: 'api' | 'browser' | 'reviewer') {
  if (method === 'browser') {
    return [
      { kind: 'screenshot', name: 'screen.png', text: 'fake-browser-screenshot' },
      { kind: 'console-log', name: 'console.log', text: '[]' },
      { kind: 'page-error-log', name: 'page-errors.log', text: '[]' },
    ]
  }
  if (method === 'api') {
    return [
      { kind: 'request', name: 'request.json', text: '{"request":"redacted"}' },
      { kind: 'response', name: 'response.json', text: '{"response":"redacted"}' },
    ]
  }
  return [
    { kind: 'review-artifact', name: 'review.md', text: 'review checklist artifact' },
  ]
}

function createBrowserPayload() {
  return {
    consoleErrors: [],
    domAssertions: [{ expectation: 'containsText', selector: '[data-testid="save-status"]', value: '保存成功' }],
    pageErrors: [],
    url: 'http://localhost:3000/settings/account',
    viewport: { height: 900, width: 1440 },
  }
}

function createApiPayload() {
  return {
    assertions: [{ expectation: 'status equals 200', kind: 'status', value: '200' }],
    request: { bodyRedacted: true, headersRedacted: true, method: 'POST', url: 'https://api.example.test/account' },
    response: { bodyRedacted: true, status: 200 },
  }
}

function createReviewerPayload(overrides: Record<string, unknown> = {}) {
  return {
    checklist: [{ item: 'Diff only changes intended files', notes: 'checked', result: 'passed' }],
    conclusion: 'Looks correct.',
    executionIdentity: 'review-job-42',
    findings: [],
    ...overrides,
  }
}

function createValidationArtifact(
  temporaryRoot: string,
  profile: typeof profiles[number] = profiles[0]!,
) {
  const artifactDir = path.join(temporaryRoot, 'artifact')
  const historyDir = path.join(temporaryRoot, 'history')
  const repository = createRepository(path.join(temporaryRoot, 'source'))
  const worktreeRoot = path.join(temporaryRoot, 'worktrees')
  const worktree = path.join(worktreeRoot, profile.id)
  runGit(repository, ['worktree', 'add', '--detach', worktree, 'HEAD'])
  fs.mkdirSync(artifactDir, { recursive: true })
  fs.mkdirSync(historyDir, { recursive: true })

  for (const relative of [
    'AGENTS.md',
    '.agents/rules/feature.rule.md',
    '.agents/rules/next-app.rule.md',
    '.agents/rules/testing.rule.md',
    '.agents/rules/packages.rule.md',
    '.agents/skills/evidence-first-development/SKILL.md',
    '.agents/skills/nextjs-app-router/SKILL.md',
    '.agents/skills/coding-standards/SKILL.md',
  ]) {
    const file = path.join(worktree, relative)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, `${relative}\n`)
  }

  const profileId = profile.id as string
  const commandReads = profileId === 'package-test'
    ? [
        'cat AGENTS.md',
        'cat .agents/rules/packages.rule.md',
        'cat .agents/rules/testing.rule.md',
        'cat .agents/skills/evidence-first-development/SKILL.md',
        'cat .agents/skills/coding-standards/SKILL.md',
      ]
    : [
        'cat AGENTS.md',
        'cat apps/client/AGENTS.md',
        'cat .agents/rules/feature.rule.md',
        'cat .agents/rules/next-app.rule.md',
        'cat .agents/rules/testing.rule.md',
        'cat .agents/skills/evidence-first-development/SKILL.md',
        'cat .agents/skills/nextjs-app-router/SKILL.md',
        'cat .agents/skills/coding-standards/SKILL.md',
      ]
  const rawLog = commandReads.map((command, index) => JSON.stringify({
    command,
    exitCode: 0,
    id: `command-${index + 1}`,
    output: '',
    processId: 'process-1',
    timestamp: `2026-07-17T00:00:0${index}.000Z`,
    type: 'command_exec',
  })).join('\n')
  const rawLogExternalPath = path.join(historyDir, `cdx-${profile.id}.jsonl`)
  fs.writeFileSync(rawLogExternalPath, `${rawLog}\n`)
  const rawLogPath = path.join(artifactDir, `${profile.id}-raw.jsonl`)
  fs.writeFileSync(rawLogPath, `${rawLog}\n`)

  const trace = parseGovernanceTrace(rawLog, profile, { rawLogPath, rootDir: worktree })
  const mutationResult = (profile.evidenceStrategies as readonly string[] | undefined)?.includes('mutation')
    ? { error: null, output: 'mutation killed', passed: true }
    : null
  const reportProfile = createPassingReport(profile)
  reportProfile.execution_id = `cdx-${profile.id}`
  reportProfile.profile = profile.id
  reportProfile.raw_log_path = `${profile.id}-raw.jsonl`
  reportProfile.read_trace = trace.readTrace
  reportProfile.raw_read_count = trace.rawReadCount
  reportProfile.unique_read_count = trace.uniqueReadCount
  reportProfile.required_read_coverage = trace.requiredReadCoverage
  reportProfile.governance_tokens = trace.governanceTokens
  reportProfile.trace_errors = trace.errors
  reportProfile.unrelated_category_reads = trace.unrelatedCategoryReads
  reportProfile.worktree = worktree
  reportProfile.mutation_result = mutationResult
  const sourceHead = gitText(repository, ['rev-parse', 'HEAD'])
  reportProfile.source_head = sourceHead
  const gatesArtifact = reportProfile.commands.gates
  const finalDiffArtifact = { files: reportProfile.diff_files, hash: reportProfile.diff_hash }
  writeJsonFile(path.join(artifactDir, `${profile.id}-gates.json`), gatesArtifact)
  writeJsonFile(path.join(artifactDir, `${profile.id}-final-diff.json`), finalDiffArtifact)
  if (mutationResult)
    writeJsonFile(path.join(artifactDir, `${profile.id}-mutation.json`), mutationResult)

  const report: RunReport = {
    generated_at: '2026-07-16T00:00:00.000Z',
    profiles: [reportProfile],
    run_id: 'run',
    source_head: sourceHead,
  }
  const manifest = {
    artifactDir,
    commands: [{
      command: 'maestro delegate',
      executionId: `cdx-${profile.id}`,
      mode: 'write' as const,
      profileId: profile.id,
      runInBackground: true as const,
      tool: 'codex' as const,
      worktree,
    }],
    endpointSnapshot: reportProfile.endpoint_snapshot,
    mainWorktreeDiffBefore: [],
    ownedWorktrees: [worktree],
    profileContractHashes: { [profile.id]: createHash('sha256').update(JSON.stringify(profile)).digest('hex') },
    rootDir: repository,
    runId: 'run',
    sourceHead,
    worktreeRoot,
  }
  writeJsonFile(path.join(artifactDir, 'manifest.json'), manifest)
  writeJsonFile(path.join(artifactDir, 'report.json'), report)
  writeJsonFile(path.join(artifactDir, 'integrity.json'), {
    generatedAt: report.generated_at,
    manifestHash: createHash('sha256').update(JSON.stringify(manifest)).digest('hex'),
    profileContractHashes: manifest.profileContractHashes,
    profiles: {
      [profile.id]: {
        diffHash: reportProfile.diff_hash,
        evidencePatchHash: createHash('sha256').update('').digest('hex'),
        evidencePatchPath: null,
        finalDiffRecordHash: createHash('sha256').update(JSON.stringify(finalDiffArtifact)).digest('hex'),
        finalDiffPath: `${profile.id}-final-diff.json`,
        gateHash: createHash('sha256').update(JSON.stringify(gatesArtifact)).digest('hex'),
        gatePath: `${profile.id}-gates.json`,
        mutationRecordHash: mutationResult ? createHash('sha256').update(JSON.stringify(mutationResult)).digest('hex') : null,
        mutationPath: mutationResult ? `${profile.id}-mutation.json` : null,
        rawLogHash: createHash('sha256').update(`${rawLog}\n`).digest('hex'),
        rawLogPath: `${profile.id}-raw.jsonl`,
        reportHash: createHash('sha256').update(JSON.stringify(reportProfile)).digest('hex'),
      },
    },
    runId: report.run_id,
    runReportHash: createHash('sha256').update(JSON.stringify(report)).digest('hex'),
    sourceHead: report.source_head,
  })
  return { artifactDir, historyDir, profile, repository, worktree }
}

function readJsonFile<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function writeJsonFile(file: string, value: unknown): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function createCliToolsFixture(temporaryRoot: string): string {
  const cliToolsPath = path.join(temporaryRoot, 'cli-tools.json')
  fs.writeFileSync(cliToolsPath, JSON.stringify({
    tools: { codex: { enabled: true, primaryModel: 'gpt-test', tags: [], type: 'builtin' } },
    version: 'test-version',
  }))
  return cliToolsPath
}

function createRepository(temporaryRoot: string): string {
  const repository = path.join(temporaryRoot, 'repository')
  fs.mkdirSync(temporaryRoot, { recursive: true })
  fs.cpSync(repositoryTemplate, repository, { recursive: true })
  return repository
}

function createRepositoryTemplate(): string {
  const templateRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-governance-repository-template-'))
  const repository = path.join(templateRoot, 'repository')
  fs.mkdirSync(repository, { recursive: true })
  runGit(repository, ['init', '--initial-branch=main'])
  runGit(repository, ['config', 'user.email', 'fixture@example.com'])
  runGit(repository, ['config', 'user.name', 'Fixture'])
  runGit(repository, ['config', 'commit.gpgSign', 'false'])
  fs.writeFileSync(path.join(repository, 'README.md'), 'fixture\n')
  runGit(repository, ['add', 'README.md'])
  runGit(repository, ['commit', '--no-verify', '-m', 'fixture'])
  return repository
}

function runGit(cwd: string, args: string[]): void {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.status !== 0)
    throw new Error(result.stderr)
}

function gitText(cwd: string, args: string[]): string {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.status !== 0)
    throw new Error(result.stderr)
  return result.stdout.trim()
}

function createPassingReport(profile: typeof profiles[number]): ProfileReport {
  const gateResults = [...profile.gates, ...(profile.regressionGates ?? [])]
    .map(gate => ({
      command: gate.kind === 'command' ? gate.command : gate.assertion,
      exitCode: gate.kind === 'command' ? 0 : null,
      kind: gate.kind,
      output: '',
      passed: true,
    }))
  const evidenceFile = profile.evidencePaths?.[0]?.replace('/**/', '/').replace('*.test.tsx', 'behavior.test.tsx').replace('*.test.ts', 'behavior.test.ts') ?? 'behavior.test.ts'
  return {
    acceptance_evidence: 'acceptance.json',
    acceptance_evidence_metadata: {
      diffHash: 'fixture-diff-hash',
      evidenceHash: createHash('sha256').update(JSON.stringify({ attachments: [], method: profile.independentAcceptance, payload: null, provenance: { actor: 'independent-test-verifier', githubActor: 'ci-bot', githubJob: 'independent-acceptance', githubRunId: 'run-1', jobIdentity: 'github-actions://independent-acceptance/run-1', level: 'independently_verified' } })).digest('hex'),
      generatedAt: '2026-07-16T00:00:00.000Z',
      method: profile.independentAcceptance,
      provenanceLevel: 'independently_verified',
      result: 'passed',
      runId: 'run',
      sourceHead: 'head',
      verifier: 'independent-test-verifier',
    },
    budget: profile.budgetTokens,
    cleanup: { owned: true, status: 'pending' },
    commands: { delegate: 'maestro delegate', gates: gateResults },
    diff_files: [(profile.allowedPaths[0] ?? '').replace('/**', '/fixture.ts')],
    diff_hash: 'fixture-diff-hash',
    endpoint_snapshot: {
      configVersion: '1',
      enabled: true,
      model: 'gpt-test',
      tags: [],
      tool: 'codex',
      type: 'builtin',
    },
    evidence_replay: profile.redGate
      ? {
          command: profile.redGate.command,
          error: null,
          exitCode: profile.redGate.expectedExitCode,
          output: profile.redGate.failurePattern,
          passed: true,
          patchFiles: [evidenceFile],
          patchPath: '/tmp/evidence.patch',
        }
      : null,
    execution_id: `cdx-${profile.id}`,
    governance_tokens: 1,
    independent_acceptance: { method: profile.independentAcceptance, status: 'independently_verified' },
    log_schema_version: 'maestro-cli-history/1',
    main_worktree_diff_before: [],
    mode: 'write',
    mutation_result: (profile.evidenceStrategies as readonly string[] | undefined)?.includes('mutation')
      ? { error: null, output: 'mutation killed', passed: true }
      : null,
    profile: profile.id,
    raw_log_path: '/tmp/log.jsonl',
    read_trace: profile.id === 'package-test'
      ? [
          { bytes: 4, path: 'AGENTS.md', tokens: 1 },
          { bytes: 4, path: '.agents/rules/packages.rule.md', tokens: 1 },
          { bytes: 4, path: '.agents/rules/testing.rule.md', tokens: 1 },
          { bytes: 4, path: '.agents/skills/evidence-first-development/SKILL.md', tokens: 1 },
          { bytes: 4, path: '.agents/skills/coding-standards/SKILL.md', tokens: 1 },
        ]
      : [
          { bytes: 4, path: 'AGENTS.md', tokens: 1 },
          { bytes: 4, path: 'apps/client/AGENTS.md', tokens: 1 },
          { bytes: 4, path: '.agents/rules/feature.rule.md', tokens: 1 },
          { bytes: 4, path: '.agents/rules/next-app.rule.md', tokens: 1 },
          { bytes: 4, path: '.agents/rules/testing.rule.md', tokens: 1 },
          { bytes: 4, path: '.agents/skills/evidence-first-development/SKILL.md', tokens: 1 },
          { bytes: 4, path: '.agents/skills/nextjs-app-router/SKILL.md', tokens: 1 },
          { bytes: 4, path: '.agents/skills/coding-standards/SKILL.md', tokens: 1 },
        ],
    read_trace_observation_limitations: ['content_read_shell_commands_only', 'model_attention_not_observable'],
    raw_read_count: profile.id === 'package-test' ? 5 : 8,
    required_read_coverage: 1,
    run_id: 'run',
    source_head: 'head',
    trace_errors: [],
    unique_read_count: profile.id === 'package-test' ? 5 : 8,
    unrelated_category_reads: [],
    verdict: 'passed',
    worktree: '/tmp/worktree',
  }
}
