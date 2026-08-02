import type { AuditFinding, AuditLocation, AuditReport, RunStaticAuditOptions } from './types.ts'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import { defaultAuditConfig } from './config.ts'

type GovernanceDocument = {
  absolutePath: string
  bytes: number
  content: string
  relativePath: string
}

const markdownLinkPattern = /\[[^\]]*\]\(([^)]+\.md(?:#[^)]*)?)\)/gu
const inlineMarkdownPathPattern = /`((?:\.agents|apps|packages)\/[\w./-]+\.md(?:#[\w./-]+)?)`/gu
const ignoredDirectories = new Set(['.git', '.next', '.turbo', '.workflow', 'coverage', 'dist', 'node_modules', '__fixtures__'])

export function runStaticAudit(options: RunStaticAuditOptions): AuditReport {
  const rootDir = path.resolve(options.rootDir)
  const config = { ...defaultAuditConfig, ...options.config }
  const documents = collectGovernanceDocuments(rootDir)
  const findings = [
    ...findOrphanRoutes(rootDir, documents),
    ...findDuplicateOwners(documents, config.duplicateMinimumCharacters),
    ...findBudgetExcesses(documents, config.documentTokenBudget),
    ...findStaleReferences(rootDir, documents),
  ].sort(compareFindings)
  const governanceBytes = documents.reduce((total, document) => total + document.bytes, 0)

  return {
    schemaVersion: 'ai-friendliness-audit/1',
    rootDir,
    verdict: findings.some(finding => finding.severity === 'error') ? 'failed' : 'passed',
    metrics: {
      estimatedTokens: estimateTokens(governanceBytes),
      governanceBytes,
      governanceFiles: documents.length,
    },
    findings,
  }
}

export function renderAuditMarkdown(report: AuditReport): string {
  const lines = [
    '# AI Friendliness Audit',
    '',
    `- Verdict: **${report.verdict}**`,
    `- Governance files: ${report.metrics.governanceFiles}`,
    `- Estimated context tokens: ${report.metrics.estimatedTokens}`,
    `- Findings: ${report.findings.length}`,
    '',
  ]

  if (report.findings.length === 0)
    return `${lines.join('\n')}No findings.\n`

  lines.push('| Severity | Check | Location | Message |', '|---|---|---|---|')
  for (const finding of report.findings)
    lines.push(`| ${finding.severity} | ${finding.checkId} | ${finding.file}:${finding.line} | ${finding.message.replaceAll('|', '\\|')} |`)
  return `${lines.join('\n')}\n`
}

function collectGovernanceDocuments(rootDir: string): GovernanceDocument[] {
  const candidates = [path.join(rootDir, 'AGENTS.md')]
  for (const directory of ['apps', 'packages'])
    collectNamedFiles(path.join(rootDir, directory), 'AGENTS.md', candidates)
  collectMarkdown(path.join(rootDir, '.agents'), candidates)

  return [...new Set(candidates)]
    .filter(file => fs.existsSync(file) && fs.statSync(file).isFile())
    .map((absolutePath) => {
      const content = fs.readFileSync(absolutePath, 'utf8')
      return {
        absolutePath,
        bytes: Buffer.byteLength(content),
        content,
        relativePath: toPosix(path.relative(rootDir, absolutePath)),
      }
    })
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath))
}

function collectNamedFiles(directory: string, name: string, output: string[]): void {
  if (!fs.existsSync(directory))
    return
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name))
      continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory())
      collectNamedFiles(target, name, output)
    else if (entry.name === name)
      output.push(target)
  }
}

function collectMarkdown(directory: string, output: string[]): void {
  if (!fs.existsSync(directory))
    return
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name))
      continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory())
      collectMarkdown(target, output)
    else if (entry.name.endsWith('.md'))
      output.push(target)
  }
}

function findOrphanRoutes(rootDir: string, documents: GovernanceDocument[]): AuditFinding[] {
  const rootEntry = documents.find(document => document.relativePath === 'AGENTS.md')
  if (!rootEntry)
    return []

  const routedPaths = new Set<string>()
  for (const line of rootEntry.content.split('\n')) {
    if (!/^\s*\|.*\|\s*$/u.test(line))
      continue
    for (const match of line.matchAll(inlineMarkdownPathPattern)) {
      const reference = match[1]?.split('#')[0]
      if (reference)
        routedPaths.add(reference)
    }
  }

  return documents
    .filter(document => /^\.agents\/rules\/[^/]+\.rule\.md$/u.test(document.relativePath))
    .filter(document => !routedPaths.has(document.relativePath))
    .map(document => ({
      checkId: 'AIFA001',
      evidence: { kind: 'route', details: { entry: 'AGENTS.md' } },
      file: toPosix(path.relative(rootDir, document.absolutePath)),
      line: 1,
      message: 'rule 未被根 AGENTS 入口路由',
      severity: 'error',
    }))
}

function findDuplicateOwners(documents: GovernanceDocument[], minimumCharacters: number): AuditFinding[] {
  const firstOwner = new Map<string, AuditLocation>()
  const findings: AuditFinding[] = []

  for (const document of documents.filter(item => /(?:\.rule\.md|\/SKILL\.md)$/u.test(item.relativePath))) {
    for (const [index, line] of document.content.split('\n').entries()) {
      const normalized = normalizeNormativeLine(line)
      if (normalized.length < minimumCharacters)
        continue
      const location = { file: document.relativePath, line: index + 1 }
      const existing = firstOwner.get(normalized)
      if (existing && existing.file !== location.file) {
        findings.push({
          checkId: 'AIFA002',
          evidence: { kind: 'similarity', details: { normalizedCharacters: normalized.length, similarity: 1 } },
          ...existing,
          message: '多个治理文件定义了相同规范正文；应指定唯一 owner',
          relatedLocations: [location],
          severity: 'warning',
        })
      }
      else {
        firstOwner.set(normalized, location)
      }
    }
  }
  return findings
}

function normalizeNormativeLine(line: string): string {
  const stripped = line
    .replace(/^\s*(?:[-*+] |\d+[.)] )/u, '')
    .replace(/`[^`]+`/gu, '<code>')
    .replace(/[\s，。；：、,.!?！？:;"'“”‘’()[\]{}<>]/gu, '')
    .toLowerCase()
  return /必须|不得|禁止|只能|应当|should|must|never|only/u.test(stripped) ? stripped : ''
}

function findBudgetExcesses(documents: GovernanceDocument[], budget: number): AuditFinding[] {
  return documents.flatMap((document) => {
    const tokens = estimateTokens(document.bytes)
    return tokens > budget
      ? [{
          checkId: 'AIFA003' as const,
          evidence: { kind: 'token-budget' as const, details: { budget, bytes: document.bytes, estimatedTokens: tokens } },
          file: document.relativePath,
          line: 1,
          message: `文档估算上下文 ${tokens} tokens，超过预算 ${budget}`,
          severity: 'warning' as const,
        }]
      : []
  })
}

function findStaleReferences(rootDir: string, documents: GovernanceDocument[]): AuditFinding[] {
  const findings: AuditFinding[] = []
  for (const document of documents) {
    for (const [index, line] of document.content.split('\n').entries()) {
      const references = [
        ...line.matchAll(markdownLinkPattern),
        ...line.matchAll(inlineMarkdownPathPattern),
      ]
      for (const match of references) {
        const reference = match[1]?.split('#')[0]
        if (!reference || /^(?:https?:|mailto:|\/|~\/)/u.test(reference) || /[*?{}]/u.test(reference))
          continue
        const target = reference.startsWith('.agents/') || reference.startsWith('apps/') || reference.startsWith('packages/')
          ? path.resolve(rootDir, reference)
          : path.resolve(path.dirname(document.absolutePath), reference)
        if (fs.existsSync(target))
          continue
        findings.push({
          checkId: 'AIFA004',
          evidence: { kind: 'filesystem', details: { reference, target: toPosix(path.relative(rootDir, target)) } },
          file: document.relativePath,
          line: index + 1,
          message: `本地 Markdown 引用不存在: ${reference}`,
          severity: 'error',
        })
      }
    }
  }
  return findings
}

function estimateTokens(bytes: number): number {
  return Math.ceil(bytes / 4)
}

function compareFindings(left: AuditFinding, right: AuditFinding): number {
  return left.file.localeCompare(right.file) || left.line - right.line || left.checkId.localeCompare(right.checkId)
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/')
}
