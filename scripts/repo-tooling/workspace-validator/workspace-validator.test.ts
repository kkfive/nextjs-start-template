import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateWorkspaceGovernance, workspaceValidationIssues } from './workspace-validator.ts'

const fixtureRoot = fileURLToPath(new URL('./__fixtures__/', import.meta.url))

const negativeCases = [
  ['missing-task', 'MISSING_REQUIRED_TASK'],
  ['stale-workspace', 'STALE_WORKSPACE_MANIFEST'],
  ['dangling-test-owner', 'DANGLING_TEST_OWNER'],
  ['omitted-test-owner', 'OMITTED_TEST_OWNER'],
] as const

describe('manifest-derived workspace and task validation', () => {
  it('ignores non-package directories matched by a generic workspace pattern', () => {
    const result = validateWorkspaceGovernance(path.join(fixtureRoot, 'generic-non-package'))
    expect(workspaceValidationIssues(result)).toEqual([])
  })

  it.each(negativeCases)('rejects handwritten %s with %s', (fixtureName, expectedCode) => {
    const result = validateWorkspaceGovernance(path.join(fixtureRoot, fixtureName))
    expect(workspaceValidationIssues(result).map(issue => issue.code)).toContain(expectedCode)
  })
})
