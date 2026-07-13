export type ArchitecturePolicyIssue = {
  ruleId: string
  file: string
  line: number
  message: string
}

export type ArchitecturePolicyContext = {
  rootDir: string
  files: string[]
}

export type ArchitecturePolicy = {
  id: string
  message: string
  check: (context: ArchitecturePolicyContext) => ArchitecturePolicyIssue[]
}

export type RunArchitecturePoliciesOptions = {
  rootDir: string
  files?: string[]
}
