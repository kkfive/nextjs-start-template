import type { GovernanceProfile } from '../../ai-governance-e2e/profiles.ts'
import type { ArchitecturePolicy, ArchitecturePolicyIssue } from '../types.ts'
import fs from 'node:fs'
import path from 'node:path'
import { profiles } from '../../ai-governance-e2e/profiles.ts'

type MarkdownReference = {
  index: number
  value: string
}

export type ProfileRoutingObservation = {
  rules: readonly string[]
  skills: readonly string[]
}

const deprecatedLiterals = [
  { pattern: /@\/components\/ui\//gu, message: '活跃治理文档不得引用已废弃路径 @/components/ui/' },
  { pattern: /tailwind\.config\.(?:js|ts)/gu, message: '活跃治理文档不得引用已废弃的 Tailwind 配置路径' },
] as const

const staleSearchPriority = /(?:Grep|Glob)[^\n]{0,100}(?:优先于|takes? priority over|before)[^\n]{0,100}maestro explore/giu

export function validateProfileRouting(
  profileId: GovernanceProfile['id'],
  observation: ProfileRoutingObservation,
): string[] {
  const profile = profiles.find(candidate => candidate.id === profileId)
  if (!profile)
    return [`unknown profile: ${profileId}`]

  const observedRules = new Set(observation.rules)
  const observedSkills = new Set(observation.skills)
  return [
    ...profile.expectedRules
      .filter(rule => !observedRules.has(rule))
      .map(rule => `${profile.id}: missing required rule ${rule}`),
    ...profile.expectedSkills
      .filter(skill => !observedSkills.has(skill))
      .map(skill => `${profile.id}: missing required skill ${skill}`),
    ...profile.forbiddenCategories
      .filter(category => observedSkills.has(category))
      .map(category => `${profile.id}: forbidden category ${category}`),
  ]
}

export const ffg08: ArchitecturePolicy = {
  id: 'FFG08',
  message: 'AI 治理引用、rule 路由、Skill metadata 与活跃路径必须保持完整一致',
  check(context) {
    const markdownFiles = collectGovernanceMarkdown(context.rootDir)
    const contents = new Map(markdownFiles.map(file => [file, fs.readFileSync(file, 'utf8')]))
    const issues: ArchitecturePolicyIssue[] = []

    for (const [file, content] of contents) {
      for (const reference of explicitMarkdownReferences(content)) {
        const target = resolveMarkdownReference(context.rootDir, file, reference.value)
        if (target && !fs.existsSync(target)) {
          const kind = reference.value.startsWith('.') ? '相对 Markdown 引用不存在' : 'Markdown 引用不存在'
          issues.push(createIssue(file, lineAt(content, reference.index), `${kind}: ${reference.value}`))
        }
      }

      for (const deprecated of deprecatedLiterals) {
        for (const match of content.matchAll(deprecated.pattern))
          issues.push(createIssue(file, lineAt(content, match.index ?? 0), deprecated.message))
      }
      for (const match of content.matchAll(staleSearchPriority))
        issues.push(createIssue(file, lineAt(content, match.index ?? 0), '活跃治理文档不得声明 Grep/Glob 优先于 maestro explore'))
    }

    issues.push(...orphanRuleIssues(context.rootDir, contents))
    issues.push(...skillRoutingIssues(context.rootDir, contents))
    issues.push(...claudeSkillCompatibilityIssues(context.rootDir))
    issues.push(...evidenceWorkflowOwnershipIssues(context.rootDir, contents))
    issues.push(...skillFrontmatterIssues(context.rootDir, contents))
    return issues
  },
}

function collectGovernanceMarkdown(rootDir: string): string[] {
  const files: string[] = []
  const rootAgents = path.join(rootDir, 'AGENTS.md')
  if (fs.existsSync(rootAgents))
    files.push(rootAgents)

  const agentsDir = path.join(rootDir, '.agents')
  function walk(directory: string) {
    if (!fs.existsSync(directory))
      return
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory())
        walk(target)
      else if (entry.isFile() && entry.name.endsWith('.md'))
        files.push(target)
    }
  }
  walk(agentsDir)
  return files.sort()
}

function explicitMarkdownReferences(content: string): MarkdownReference[] {
  const references: MarkdownReference[] = []
  const seen = new Set<string>()
  const add = (value: string, index: number, allowBare = false) => {
    const normalized = value.replace(/^<|>$/gu, '').split('#', 1)[0]?.replace(/:\d+$/u, '') ?? ''
    if (!normalized.endsWith('.md') || /[*?{}[\]]/u.test(normalized))
      return
    if (!allowBare && !normalized.includes('/') && normalized !== 'AGENTS.md' && normalized !== 'CLAUDE.md')
      return
    const key = `${index}:${normalized}`
    if (!seen.has(key)) {
      seen.add(key)
      references.push({ index, value: normalized })
    }
  }

  for (const match of content.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*)?\)/gu))
    add(match[1] ?? '', match.index ?? 0, true)

  for (const match of content.matchAll(/`([^`\n]+)`/gu)) {
    const inline = match[1] ?? ''
    for (const candidate of inline.matchAll(/(?:^|[\s("'])((?:\.{1,2}\/|\.agents\/|apps\/|packages\/|internal\/|scripts\/|\.github\/)?[\w.-]+(?:\/[\w.-]+)*\.md)(?=$|[\s)"',:])/gu)) {
      const value = candidate[1] ?? ''
      if (/^(?:\.{1,2}\/|\.agents\/|apps\/|packages\/|internal\/|scripts\/|\.github\/)/u.test(value))
        add(value, (match.index ?? 0) + (candidate.index ?? 0))
    }
  }

  for (const match of content.matchAll(/@([^\s,;)]+\.md)/gu))
    add(match[1] ?? '', match.index ?? 0)

  return references
}

function resolveMarkdownReference(rootDir: string, sourceFile: string, reference: string): string | undefined {
  if (/^(?:https?:|mailto:|~\/|\/)/u.test(reference))
    return undefined
  if (reference.startsWith('../') || reference.startsWith('./'))
    return path.resolve(path.dirname(sourceFile), reference)
  if (/^(?:\.agents|apps|packages|internal|scripts|\.github)\//u.test(reference) || reference === 'AGENTS.md' || reference === 'CLAUDE.md')
    return path.resolve(rootDir, reference)

  const skillsDir = path.join(rootDir, '.agents', 'skills')
  const skillRelative = path.relative(skillsDir, sourceFile)
  if (!skillRelative.startsWith('..') && !path.isAbsolute(skillRelative)) {
    const [skillName] = skillRelative.split(path.sep)
    if (skillName) {
      if (/^(?:references|rules|workflows|assets|scripts)\//u.test(reference))
        return path.resolve(skillsDir, skillName, reference)
      const referencedSkill = reference.split('/', 1)[0]
      if (referencedSkill && fs.existsSync(path.join(skillsDir, referencedSkill)))
        return path.resolve(skillsDir, reference)
    }
  }
  return path.resolve(path.dirname(sourceFile), reference)
}

function orphanRuleIssues(rootDir: string, contents: Map<string, string>): ArchitecturePolicyIssue[] {
  const rulesDir = path.join(rootDir, '.agents', 'rules')
  if (!fs.existsSync(rulesDir))
    return []
  const references = [...contents.values()].join('\n')
  return fs.readdirSync(rulesDir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isFile() || !entry.name.endsWith('.rule.md'))
      return []
    const routePath = `.agents/rules/${entry.name}`
    if (references.includes(routePath) || references.includes(entry.name))
      return []
    return [createIssue(path.join(rulesDir, entry.name), 1, `rule 未被 AGENTS 路由: ${entry.name}`)]
  })
}

function skillRoutingIssues(rootDir: string, contents: Map<string, string>): ArchitecturePolicyIssue[] {
  const skillsDir = path.join(rootDir, '.agents', 'skills')
  const rootAgents = path.join(rootDir, 'AGENTS.md')
  if (!fs.existsSync(skillsDir) || !contents.has(rootAgents))
    return []
  const routes = contents.get(rootAgents) ?? ''
  return fs.readdirSync(skillsDir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() || !fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
      return []
    if (routes.includes(entry.name))
      return []
    return [createIssue(path.join(skillsDir, entry.name, 'SKILL.md'), 1, `Skill 未被 AGENTS 路由: ${entry.name}`)]
  })
}

function claudeSkillCompatibilityIssues(rootDir: string): ArchitecturePolicyIssue[] {
  const canonicalSkills = path.join(rootDir, '.agents', 'skills')
  if (!fs.existsSync(canonicalSkills))
    return []

  const compatibilitySkills = path.join(rootDir, '.claude', 'skills')
  if (!fs.existsSync(path.join(rootDir, '.claude')))
    return []
  try {
    if (!fs.lstatSync(compatibilitySkills).isSymbolicLink() || fs.readlinkSync(compatibilitySkills) !== '../.agents/skills')
      return [createIssue(compatibilitySkills, 1, '.claude/skills 必须是指向 ../.agents/skills 的符号链接')]
    if (!fs.statSync(compatibilitySkills).isDirectory())
      return [createIssue(compatibilitySkills, 1, '.claude/skills 符号链接目标必须存在且为目录')]
    return []
  }
  catch {
    return [createIssue(compatibilitySkills, 1, '.claude/skills 必须是指向 ../.agents/skills 的符号链接')]
  }
}

function evidenceWorkflowOwnershipIssues(rootDir: string, contents: Map<string, string>): ArchitecturePolicyIssue[] {
  const owner = path.join(rootDir, '.agents', 'skills', 'evidence-first-development', 'SKILL.md')
  if (!fs.existsSync(owner))
    return []
  return [...contents].flatMap(([file, content]) => {
    if (file === owner || file.startsWith(`${path.dirname(owner)}${path.sep}`))
      return []
    const numberedSteps = content.split(/\r?\n/u).filter(line => /^\s*\d+\.\s/u.test(line)).length
    const copiesDetailedWorkflow = /^## Full workflow$/mu.test(content)
      && numberedSteps >= 3
      && /\bRED\b/u.test(content)
      && /\bGREEN\b/u.test(content)
    return copiesDetailedWorkflow
      ? [createIssue(file, lineAt(content, content.search(/^## Full workflow$/mu)), '完整行为/证据流程只能由 evidence-first-development Skill 维护')]
      : []
  })
}

function skillFrontmatterIssues(rootDir: string, contents: Map<string, string>): ArchitecturePolicyIssue[] {
  const skillsDir = path.join(rootDir, '.agents', 'skills')
  if (!fs.existsSync(skillsDir))
    return []
  return [...contents].flatMap(([file, content]) => {
    if (path.basename(file) !== 'SKILL.md' || path.dirname(path.dirname(file)) !== skillsDir)
      return []
    const expectedName = path.basename(path.dirname(file))
    const actualName = frontmatterName(content)
    if (actualName === expectedName)
      return []
    return [createIssue(file, 1, `Skill frontmatter name 必须等于目录名: expected ${expectedName}, received ${actualName ?? 'missing'}`)]
  })
}

function frontmatterName(content: string): string | undefined {
  const lines = content.split(/\r?\n/u)
  if (lines[0]?.trim() !== '---')
    return undefined
  for (const line of lines.slice(1)) {
    if (line.trim() === '---')
      return undefined
    if (line.startsWith('name:'))
      return line.slice('name:'.length).trim().replace(/^["']|["']$/gu, '')
  }
  return undefined
}

function createIssue(file: string, line: number, message: string): ArchitecturePolicyIssue {
  return { file, line, message, ruleId: 'FFG08' }
}

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length
}
