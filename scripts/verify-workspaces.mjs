import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateWorkspaceGovernance, workspaceValidationIssues } from './repo-tooling/workspace-validator/workspace-validator.ts'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function valueAfter(flag) {
  const index = process.argv.indexOf(flag)
  return index === -1 ? undefined : process.argv[index + 1]
}

const rootDir = path.resolve(valueAfter('--root') ?? repositoryRoot)

try {
  const result = validateWorkspaceGovernance(rootDir)
  const issues = workspaceValidationIssues(result)
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  for (const issue of issues) {
    process.stderr.write(`[${issue.code}] ${issue.workspace}${issue.task ? `: ${issue.task}` : ''}\n`)
  }
  if (issues.length > 0)
    process.exitCode = 1
}
catch (error) {
  process.stderr.write(`[WORKSPACE_VALIDATION_ERROR] ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
}
