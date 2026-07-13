import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import ts from 'typescript'
import { collectImportReferences, collectPolicyFiles } from './parser.ts'
import { architecturePolicyRegistry } from './registry.ts'
import { runArchitecturePolicy } from './runner.ts'

const fixtureRoot = fileURLToPath(new URL('./__fixtures__/', import.meta.url))
const repositoryRoot = path.resolve(import.meta.dirname, '../../..')
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

  it('ignores generated workflow and turbo directories', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-policy-'))
    try {
      for (const directory of ['.turbo', '.workflow', 'src'])
        fs.mkdirSync(path.join(root, directory), { recursive: true })
      fs.writeFileSync(path.join(root, '.turbo/cache.ts'), 'export const cache = true\n')
      fs.writeFileSync(path.join(root, '.workflow/state.ts'), 'export const state = true\n')
      fs.writeFileSync(path.join(root, 'src/index.ts'), 'export const source = true\n')

      expect(collectPolicyFiles(root).map(file => path.relative(root, file))).toEqual(['src/index.ts'])
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
    expect(issues[0]?.file).toContain('/invalid/')
    expect(issues[0]?.line).toBeGreaterThan(0)
  })

  it('cli returns a non-zero exit code and the failing ruleId for an invalid fixture', () => {
    const result = spawnSync(process.execPath, [cli, '--root', fixture('FFG04', 'invalid'), '--rule', 'FFG04'], { encoding: 'utf8' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('[FFG04]')
  })
})
