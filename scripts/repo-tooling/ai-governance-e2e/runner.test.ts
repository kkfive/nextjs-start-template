import type { ProfileReport } from './runner.ts'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { profiles } from './profiles.ts'
import {
  assertCleanSource,
  cleanupRun,
  parseGitStatusPaths,
  prepareRun,
  validateReportAgainstProfiles,
} from './runner.ts'
import { parseGovernanceTrace } from './trace.ts'

const fixtureRoot = fileURLToPath(new URL('./__fixtures__/', import.meta.url))

describe('ai governance profile contract', () => {
  it('keeps the three business prompts exact and free of governance hints', () => {
    expect(profiles.map(profile => [profile.id, profile.prompt])).toEqual([
      ['next-page', '在 apps/client 新增账户设置页面：路由只组合 feature 公开入口，Server Component 获取首屏数据，Client Component 使用现有表单与共享基础控件完成保存交互；补齐必要测试。'],
      ['package-test', '为 packages/http-client 的 BusinessError、createErrorResponse 和 HttpService 增加错误路径、边界与网络隔离测试；在该 package 内补齐 test:run，使 pnpm --filter @kkfive/http-client test:run 可执行。'],
      ['monorepo-config', '为 CI 的 test/build job 持久化 Turbo cache，保持 verify 全量、PR affected 与 push 全量语义，并补充可复现验证。'],
    ])
    expect(profiles.some(profile => /\.agents|AGENTS\.md|maestro search|maestro explore|rule|skill/iu.test(profile.prompt))).toBe(false)
  })

  it('keeps the routing oracle, budgets and thresholds immutable', () => {
    expect(profiles).toMatchObject([
      {
        allowedPaths: ['apps/client/**'],
        budgetTokens: 6400,
        expectedRules: ['feature.rule.md', 'next-app.rule.md', 'testing.rule.md'],
        expectedSkills: ['nextjs-app-router', 'coding-standards'],
        forbiddenCategories: ['project-architecture', 'styling-system', 'monorepo-engineering'],
        maxForbiddenCategoryHits: 0,
        requiredHitRate: 1,
      },
      {
        allowedPaths: ['packages/http-client/**'],
        budgetTokens: 3000,
        expectedRules: ['packages.rule.md', 'testing.rule.md'],
        expectedSkills: ['coding-standards'],
        forbiddenCategories: ['nextjs-app-router', 'styling-system', 'project-architecture', 'monorepo-engineering'],
        maxForbiddenCategoryHits: 0,
        requiredHitRate: 1,
      },
      {
        allowedPaths: ['.github/workflows/ci.yml', 'turbo.json', 'package.json'],
        budgetTokens: 3000,
        expectedRules: ['monorepo.rule.md'],
        expectedSkills: ['monorepo-engineering'],
        forbiddenCategories: ['nextjs-app-router', 'styling-system', 'coding-standards', 'project-architecture'],
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
    expect(trace.readTrace).toHaveLength(5)
    expect(trace.governanceTokens).toBe(5)
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
    const trace = parseFixture('budget-exceeded', profiles[1], () => 'x'.repeat(5000))
    expect(trace.status).toBe('ok')
    expect(trace.governanceTokens).toBeGreaterThan(profiles[1].budgetTokens)
  })
})

describe('prepare, report validation and cleanup', () => {
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

      expect(manifest.commands).toHaveLength(3)
      expect(new Set(manifest.commands.map(command => command.executionId)).size).toBe(3)
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

  it('validates reports dynamically against imported profiles', () => {
    const reports = profiles.map(profile => createPassingReport(profile.id, profile.budgetTokens, profile.allowedPaths[0] ?? ''))
    expect(validateReportAgainstProfiles(reports, profiles)).toEqual({ issues: [], valid: true })
    reports[0] = { ...reports[0]!, verdict: 'failed' }
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

function createRepository(temporaryRoot: string): string {
  const repository = path.join(temporaryRoot, 'repository')
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

function createPassingReport(profile: string, budget: number, allowedFile: string): ProfileReport {
  return {
    budget,
    cleanup: { owned: true, status: 'pending' },
    commands: { delegate: 'maestro delegate', gates: [] },
    diff_files: [allowedFile.replace('/**', '/fixture.ts')],
    endpoint_snapshot: {
      configVersion: '1',
      enabled: true,
      model: 'gpt-test',
      tags: [],
      tool: 'codex',
      type: 'builtin',
    },
    execution_id: `cdx-${profile}`,
    governance_tokens: 1,
    log_schema_version: 'maestro-cli-history/1',
    main_worktree_diff_before: [],
    mode: 'write',
    profile,
    raw_log_path: '/tmp/log.jsonl',
    read_trace: [],
    required_read_coverage: 1,
    run_id: 'run',
    source_head: 'head',
    trace_errors: [],
    unrelated_category_reads: [],
    verdict: 'passed',
    worktree: '/tmp/worktree',
  }
}
