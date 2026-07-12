import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import ts from 'typescript'
import { collectImportReferences } from './parser.ts'
import { architecturePolicyRegistry } from './registry.ts'
import { runArchitecturePolicy } from './runner.ts'

const fixtureRoot = fileURLToPath(new URL('./__fixtures__/', import.meta.url))
const repositoryRoot = path.resolve(import.meta.dirname, '../../../..')
const cli = path.join(repositoryRoot, 'scripts/verify-conventions.mjs')

function fixture(ruleId: string, kind: 'valid' | 'invalid'): string {
  return path.join(fixtureRoot, ruleId, kind)
}

describe('architecture policy registry', () => {
  it('parses every supported import form through the TypeScript AST', () => {
    const source = ts.createSourceFile('forms.ts', [
      "import { value } from './static'",
      "export { value } from './exported'",
      "type Imported = import('./typed').Imported",
      "await import('./dynamic')",
      "require('./required')",
    ].join('\n'), ts.ScriptTarget.Latest, true)

    expect(collectImportReferences(source).map(reference => reference.kind)).toEqual([
      'import',
      'export',
      'import-type',
      'dynamic-import',
      'require',
    ])
  })

  it.each(architecturePolicyRegistry.map(policy => [policy.id]))('%s accepts its valid fixture', (ruleId) => {
    expect(runArchitecturePolicy(ruleId, { rootDir: fixture(ruleId, 'valid') })).toEqual([])
  })

  it.each(architecturePolicyRegistry.map(policy => [policy.id]))('%s reports ruleId, file and line for its invalid fixture', (ruleId) => {
    const issues = runArchitecturePolicy(ruleId, { rootDir: fixture(ruleId, 'invalid') })
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ ruleId })
    expect(issues[0]?.file).toContain('/invalid/')
    expect(issues[0]?.line).toBeGreaterThan(0)
  })

  it('CLI returns a non-zero exit code and the failing ruleId for an invalid fixture', () => {
    const result = spawnSync(process.execPath, [cli, '--root', fixture('FFG04', 'invalid'), '--rule', 'FFG04'], { encoding: 'utf8' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('[FFG04]')
  })
})
