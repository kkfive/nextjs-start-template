#!/usr/bin/env node
/** TypeScript AST architecture-policy 的命令行适配层。 */
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { runArchitecturePolicies, runArchitecturePolicy } from './repo-tooling/architecture-policy/runner.ts'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootOption = process.argv.indexOf('--root')
const rootDir = rootOption === -1 ? repositoryRoot : path.resolve(process.argv[rootOption + 1] ?? repositoryRoot)
const ruleOption = process.argv.indexOf('--rule')
const ruleId = ruleOption === -1 ? undefined : process.argv[ruleOption + 1]
const issues = ruleId ? runArchitecturePolicy(ruleId, { rootDir }) : runArchitecturePolicies({ rootDir })

if (issues.length === 0) {
  console.log('Architecture policy passed.')
  process.exit(0)
}

for (const current of issues)
  console.error(`[${current.ruleId}] ${path.relative(rootDir, current.file)}:${current.line} ${current.message}`)
process.exit(1)
