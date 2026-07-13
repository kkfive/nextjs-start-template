import type { ArchitecturePolicyIssue, RunArchitecturePoliciesOptions } from './types.ts'
import path from 'node:path'
import { collectPolicyFiles } from './parser.ts'
import { architecturePolicyRegistry } from './registry.ts'

export function runArchitecturePolicies(options: RunArchitecturePoliciesOptions): ArchitecturePolicyIssue[] {
  const rootDir = path.resolve(options.rootDir)
  const files = (options.files ?? collectPolicyFiles(rootDir)).map(file => path.resolve(file))
  return architecturePolicyRegistry.flatMap(policy => policy.check({ rootDir, files }))
}

export function runArchitecturePolicy(ruleId: string, options: RunArchitecturePoliciesOptions): ArchitecturePolicyIssue[] {
  const policy = architecturePolicyRegistry.find(candidate => candidate.id === ruleId)
  if (!policy)
    throw new Error(`Unknown architecture policy: ${ruleId}`)
  const rootDir = path.resolve(options.rootDir)
  const files = (options.files ?? collectPolicyFiles(rootDir)).map(file => path.resolve(file))
  return policy.check({ rootDir, files })
}
