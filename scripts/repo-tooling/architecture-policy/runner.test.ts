import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { profiles } from '../ai-governance-e2e/profiles.ts'
import { collectImportReferences, collectPolicyFiles } from './parser.ts'
import { architecturePolicyRegistry } from './registry.ts'
import { validateProfileRouting } from './rules/ffg08.ts'
import { runArchitecturePolicy } from './runner.ts'

const fixtureRoot = fileURLToPath(new URL('./__fixtures__/', import.meta.url))
const repositoryRoot = path.resolve(import.meta.dirname, '../../..')
const cli = path.join(repositoryRoot, 'scripts/verify-conventions.mjs')

function fixture(ruleId: string, kind: 'valid' | 'invalid'): string {
  return path.join(fixtureRoot, ruleId, kind)
}

function ffg02Scenario(name: string): string {
  return path.join(fixtureRoot, 'FFG02', 'scenarios', name)
}

function ffg03Scenario(name: string): string {
  return path.join(fixtureRoot, 'FFG03', 'scenarios', name)
}

function ffg04Scenario(name: string): string {
  return path.join(fixtureRoot, 'FFG04', 'scenarios', name)
}

function ffg07Scenario(name: string): string {
  return path.join(fixtureRoot, 'FFG07', 'scenarios', name)
}

function ffg08Scenario(name: string): string {
  return path.join(fixtureRoot, 'FFG08', 'scenarios', name)
}

function toPosixPath(file: string): string {
  return file.split(path.sep).join('/')
}

describe('architecture policy registry', () => {
  it('parses every supported import form through the TypeScript AST', () => {
    const source = ts.createSourceFile('forms.ts', [
      'import { value } from \'./static\'',
      'export { value } from \'./exported\'',
      'type Imported = import(\'./typed\').Imported',
      'await import(\'./dynamic\')',
      'require(\'./required\')',
    ].join('\n'), ts.ScriptTarget.Latest, true)

    expect(collectImportReferences(source).map(reference => reference.kind)).toEqual([
      'import',
      'export',
      'import-type',
      'dynamic-import',
      'require',
    ])
  })

  it('ignores generated workflow and turbo directories', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-policy-'))
    try {
      for (const directory of ['.turbo', '.workflow', 'src'])
        fs.mkdirSync(path.join(root, directory), { recursive: true })
      fs.writeFileSync(path.join(root, '.turbo/cache.ts'), 'export const cache = true\n')
      fs.writeFileSync(path.join(root, '.workflow/state.ts'), 'export const state = true\n')
      fs.writeFileSync(path.join(root, 'src/index.ts'), 'export const source = true\n')

      expect(collectPolicyFiles(root).map(file => toPosixPath(path.relative(root, file)))).toEqual(['src/index.ts'])
    }
    finally {
      fs.rmSync(root, { force: true, recursive: true })
    }
  })

  it.each(architecturePolicyRegistry.map(policy => [policy.id]))('%s accepts its valid fixture', (ruleId) => {
    expect(runArchitecturePolicy(ruleId, { rootDir: fixture(ruleId, 'valid') })).toEqual([])
  })

  it.each(architecturePolicyRegistry.map(policy => [policy.id]))('%s reports ruleId, file and line for its invalid fixture', (ruleId) => {
    const issues = runArchitecturePolicy(ruleId, { rootDir: fixture(ruleId, 'invalid') })
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ ruleId })
    expect(toPosixPath(issues[0]?.file ?? '')).toContain('/invalid/')
    expect(issues[0]?.line).toBeGreaterThan(0)
  })

  it('keeps FFG modules, registry entries and fixture IDs equal', () => {
    const ruleIds = fs.readdirSync(path.join(repositoryRoot, 'scripts/repo-tooling/architecture-policy/rules'))
      .flatMap(file => file.match(/^ffg(\d+)\.ts$/u)?.[1] ? [`FFG${file.match(/^ffg(\d+)\.ts$/u)?.[1]}`] : [])
      .sort()
    const registryIds = architecturePolicyRegistry.map(policy => policy.id).sort()
    const fixtureIds = fs.readdirSync(fixtureRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory()
        && fs.existsSync(path.join(fixtureRoot, entry.name, 'valid'))
        && fs.existsSync(path.join(fixtureRoot, entry.name, 'invalid')))
      .map(entry => entry.name)
      .sort()

    expect(registryIds).toEqual(ruleIds)
    expect(fixtureIds).toEqual(ruleIds)
  })

  it.each([
    'client-directive',
    'client-state-use-state',
    'client-state-use-reducer',
    'client-state-use-effect',
    'client-state-use-layout-effect',
    'client-state-use-sync-external-store',
    'deep-feature-import',
    'direct-service-import',
    'direct-request-call',
    'direct-request-axios',
  ])('rejects FFG02 independent %s scenario with one located issue', (scenario) => {
    const issues = runArchitecturePolicy('FFG02', { rootDir: ffg02Scenario(scenario) })

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ ruleId: 'FFG02' })
    expect(toPosixPath(issues[0]?.file ?? '')).toContain(`/scenarios/${scenario}/`)
    expect(issues[0]?.line).toBeGreaterThan(0)
  })

  it.each([
    'allowed-route-imports',
    'stable-feature-call',
    'next-helper-call',
  ])('accepts FFG02 source-aware %s scenario', (scenario) => {
    expect(runArchitecturePolicy('FFG02', { rootDir: ffg02Scenario(scenario) })).toEqual([])
  })

  it.each([
    'invalid-basename',
    'nested-service',
    'missing-client-only',
    'missing-server-only',
    'opposite-marker',
    'bound-client-marker',
    'invalid-apptype-owner',
    'invalid-apptype-value',
    'business-export-function',
    'business-export-class',
    'business-export-hook',
    'business-export-store',
    'business-export-calls',
  ])('rejects FFG03 independent %s scenario with one located issue', (scenario) => {
    const issues = runArchitecturePolicy('FFG03', { rootDir: ffg03Scenario(scenario) })

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ ruleId: 'FFG03' })
    expect(toPosixPath(issues[0]?.file ?? '')).toContain(`/scenarios/${scenario}/`)
    expect(issues[0]?.line).toBeGreaterThan(0)
  })

  it.each([
    'export-star',
    'direct-named-export-ui',
    'direct-named-export-antd',
    'import-then-export',
  ])('rejects FFG04 %s UI passthrough scenario with one located issue', (scenario) => {
    const issues = runArchitecturePolicy('FFG04', { rootDir: ffg04Scenario(scenario) })

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ ruleId: 'FFG04' })
    expect(toPosixPath(issues[0]?.file ?? '')).toContain(`/scenarios/${scenario}/`)
    expect(issues[0]?.line).toBeGreaterThan(0)
  })

  it.each([
    'valid-wrapper',
    'direct-antd-import',
  ])('accepts FFG04 %s implementation scenario', (scenario) => {
    expect(runArchitecturePolicy('FFG04', { rootDir: ffg04Scenario(scenario) })).toEqual([])
  })

  it('rejects FFG07 disabled-rule scenario', () => {
    const issues = runArchitecturePolicy('FFG07', { rootDir: ffg07Scenario('disabled-rule') })

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ ruleId: 'FFG07' })
    expect(issues[0]?.message).toContain('必须保持启用')
  })

  it('rejects FFG07 missing-required-pattern scenario and reports the missing pattern', () => {
    const issues = runArchitecturePolicy('FFG07', { rootDir: ffg07Scenario('missing-required-pattern') })

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ ruleId: 'FFG07' })
    expect(issues[0]?.message).toContain('next/*')
  })

  it('accepts FFG07 exact-six-required-patterns scenario', () => {
    expect(runArchitecturePolicy('FFG07', { rootDir: ffg07Scenario('exact-six-required-patterns') })).toEqual([])
  })

  it('validates FFG08 governance integrity against missing, broken, orphaned, mismatched and deprecated cases', () => {
    const scenarios = [
      ['missing-reference', '引用不存在'],
      ['broken-relative-reference', '引用不存在'],
      ['orphan-rule', 'rule 未被 AGENTS 路由'],
      ['orphan-skill', 'Skill 未被 AGENTS 路由'],
      ['duplicate-workflow-owner', '完整行为/证据流程只能由 evidence-first-development Skill 维护'],
      ['frontmatter-mismatch', 'frontmatter name'],
      ['deprecated-path', '已废弃路径'],
    ] as const

    for (const [scenario, message] of scenarios) {
      const issues = runArchitecturePolicy('FFG08', { rootDir: ffg08Scenario(scenario) })
      expect(issues, scenario).toHaveLength(1)
      expect(issues[0], scenario).toMatchObject({ ruleId: 'FFG08' })
      expect(issues[0]?.message, scenario).toContain(message)
      expect(issues[0]?.line, scenario).toBeGreaterThan(0)
    }
  })

  it('validates FFG08 profile contract import with dynamic valid, missing-required and forbidden-category cases', () => {
    for (const profile of profiles) {
      const valid = { rules: [...profile.expectedRules], skills: [...profile.expectedSkills] }
      expect(validateProfileRouting(profile.id, valid), profile.id).toEqual([])

      const missing = profile.expectedRules.length > 0
        ? { ...valid, rules: valid.rules.slice(1) }
        : { ...valid, skills: valid.skills.slice(1) }
      expect(validateProfileRouting(profile.id, missing).some(issue => issue.includes('missing required')), profile.id).toBe(true)

      const forbiddenCategory = profile.forbiddenCategories[0]
      expect(forbiddenCategory, profile.id).toBeDefined()
      expect(validateProfileRouting(profile.id, {
        ...valid,
        skills: [...valid.skills, forbiddenCategory!],
      }).some(issue => issue.includes('forbidden category')), profile.id).toBe(true)
    }
  })

  it('validates FFG08 no copied oracle ownership for profile prompts and routing tables', () => {
    const policySource = fs.readFileSync(path.join(repositoryRoot, 'scripts/repo-tooling/architecture-policy/rules/ffg08.ts'), 'utf8')
    const fixtureSource = readFilesRecursively(path.join(fixtureRoot, 'FFG08')).join('\n')
    const ownedSource = `${policySource}\n${fixtureSource}`

    for (const profile of profiles) {
      expect(ownedSource).not.toContain(profile.prompt)
      expect(ownedSource).not.toContain(String(profile.budgetTokens))
      for (const oracle of [profile.allowedPaths, profile.expectedRules, profile.expectedSkills, profile.forbiddenCategories])
        expect(ownedSource).not.toContain(JSON.stringify(oracle))
    }
  })

  it('cli returns a non-zero exit code and the failing ruleId for an invalid fixture', () => {
    const result = spawnSync(process.execPath, [cli, '--root', fixture('FFG04', 'invalid'), '--rule', 'FFG04'], { encoding: 'utf8' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('[FFG04]')
  })
})

function readFilesRecursively(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? readFilesRecursively(target) : [fs.readFileSync(target, 'utf8')]
  })
}
