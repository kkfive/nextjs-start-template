#!/usr/bin/env node
/**
 * 架构规范校验脚本
 *
 * 校验 AI 生成的代码是否符合项目规范（monorepo 依赖方向、包红线、先查后建等）。
 * 可在 pre-commit hook 或 CI 中运行。
 *
 * Usage:
 *   node scripts/verify-conventions.mjs              # 全量检查
 *   node scripts/verify-conventions.mjs <file-path>  # 单文件检查
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ============================================================
// 颜色输出
// ============================================================
const c = {
  red: s => `\x1B[31m${s}\x1B[0m`,
  green: s => `\x1B[32m${s}\x1B[0m`,
  yellow: s => `\x1B[33m${s}\x1B[0m`,
  gray: s => `\x1B[90m${s}\x1B[0m`,
  bold: s => `\x1B[1m${s}\x1B[0m`,
}

// ============================================================
// 规则定义
// ============================================================
const rules = []

function rule(id, message, checkFn) {
  rules.push({ id, message, checkFn })
}

// --------------------------------------------------
// 包红线（物理隔离 + README 锚点）
// --------------------------------------------------

rule('P01', '服务端（apps/api）不可 import @kkfive/utils/dom（common/dom 物理红线）', (_ctx) => {
  const issues = []
  const apiFiles = globSync('apps/api/src/**/*.ts', ROOT)
  for (const file of apiFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (/@kkfive\/utils\/dom/.test(lines[i])) {
        issues.push({ file, line: i + 1, message: 'apps/api 是服务端，不可 import @kkfive/utils/dom（dom 仅浏览器；服务端用 @kkfive/utils/common）' })
      }
    }
  }
  return issues
})

rule('P02', '每个 package 必须有 README.md（防架构偏移锚点）', (_ctx) => {
  const issues = []
  const packagesDir = path.join(ROOT, 'packages')
  if (!fs.existsSync(packagesDir))
    return issues
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    const readme = path.join(packagesDir, entry.name, 'README.md')
    if (!fs.existsSync(readme)) {
      issues.push({ file: readme, line: 1, message: `packages/${entry.name} 缺少 README.md（作用 + 依赖红线 + 消费方式）` })
    }
  }
  return issues
})

// --------------------------------------------------
// UI 层规范
// --------------------------------------------------

rule('U02', 'UI 组件（domain 相关）不应包含 any 类型', (_ctx) => {
  const issues = []
  const domainUiFiles = [...globSync('src/components/domain/**/*.ts*', ROOT), ...globSync('apps/*/src/components/domain/**/*.ts*', ROOT)]
  for (const file of domainUiFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith('//') || line.trim().startsWith('*'))
        continue
      if (line.includes('import '))
        continue
      if (/:\s*any\b/.test(line) || /\|\s*any\b/.test(line) || /as\s+any\b/.test(line)) {
        issues.push({ file, line: i + 1, message: `包含 any 类型: ${line.trim()}` })
      }
    }
  }
  return issues
})

// --------------------------------------------------
// service / lib 规范
// --------------------------------------------------

rule('L01', 'BusinessError 不应使用 as 类型断言', (_ctx) => {
  const issues = []
  const requestFiles = globSync('src/lib/request/**/*.ts', ROOT)
  for (const file of requestFiles) {
    if (file.endsWith('.test.ts'))
      continue
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(' as ')) {
        issues.push({
          file,
          line: i + 1,
          message: `包含类型断言（as），应使用类型守卫或正确声明类型：${lines[i].trim()}`,
        })
      }
    }
  }
  return issues
})

rule('L02', 'src/service/ 拦截器不应包含 console.error / console.warn', (_ctx) => {
  const issues = []
  const serviceFiles = [...globSync('src/service/**/*.ts', ROOT), ...globSync('apps/*/src/service/**/*.ts', ROOT)]
  for (const file of serviceFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('console.error(') || lines[i].includes('console.warn(')) {
        issues.push({
          file,
          line: i + 1,
          message: `拦截器中不应使用 console.error/console.warn，应通过 error-handler 统一处理：${lines[i].trim()}`,
        })
      }
    }
  }
  return issues
})

rule('L03', 'src/lib/request/type.ts 应优先使用 type（非 interface）', (_ctx) => {
  const issues = []
  const candidates = [
    path.join(ROOT, 'src/lib/request/type.ts'),
    ...globSync('apps/*/src/lib/request/type.ts', ROOT),
  ]
  for (const file of candidates) {
    if (!fs.existsSync(file))
      continue
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*export\s+interface\s+/.test(lines[i])) {
        issues.push({
          file,
          line: i + 1,
          message: '项目规范优先使用 type（非 interface）',
        })
      }
    }
  }
  return issues
})

// --------------------------------------------------
// 规则治理文档
// --------------------------------------------------

rule('G01', 'AGENTS.md 应含 always-applicable 标签并引用核心规则源', (_ctx) => {
  const file = path.join(ROOT, 'AGENTS.md')
  if (!fs.existsSync(file))
    return [{ file, line: 1, message: '缺少 AGENTS.md' }]
  const content = fs.readFileSync(file, 'utf-8')
  const issues = []
  if (!content.includes('<always-applicable>')) {
    issues.push({ file, line: 1, message: 'AGENTS.md 应含 <always-applicable> XML 标签（抗上下文压缩）' })
  }
  if (!content.includes('@.agents/rules/core.rule.md')) {
    issues.push({ file, line: 1, message: 'AGENTS.md 应引用 @.agents/rules/core.rule.md，避免复制完整规则清单' })
  }
  return issues
})

rule('G02', '包级 AGENTS.md 应含 always-applicable 标签', (_ctx) => {
  const issues = []
  const packageAgents = [
    ...globSync('apps/**/AGENTS.md', ROOT),
    ...globSync('packages/**/AGENTS.md', ROOT),
  ]
  for (const file of packageAgents) {
    const content = fs.readFileSync(file, 'utf-8')
    if (!content.includes('<always-applicable>')) {
      issues.push({ file, line: 1, message: '包级 AGENTS.md 应含 <always-applicable> XML 标签（抗上下文压缩）' })
    }
  }
  return issues
})

rule('G02b', 'Domain skill 应引用 Domain 规则源', (_ctx) => {
  const file = path.join(ROOT, '.agents/skills/domain-layer/SKILL.md')
  if (!fs.existsSync(file))
    return []
  const content = fs.readFileSync(file, 'utf-8')
  if (!content.includes('.agents/rules/domain.rule.md')) {
    return [{ file, line: 1, message: 'domain-layer skill 应引用 .agents/rules/domain.rule.md，避免成为重复规则源' }]
  }
  return []
})

rule('G03', '文档示例不应推荐 class Controller', (_ctx) => {
  const issues = []
  const markdownFiles = [
    ...globSync('docs/**/*.md', ROOT),
    ...globSync('.agents/skills/**/*.md', ROOT),
    path.join(ROOT, 'readme.md'),
    path.join(ROOT, 'AGENTS.md'),
  ].filter(file => fs.existsSync(file))

  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes('export class Controller'))
        continue
      const nearby = lines.slice(Math.max(0, i - 8), i + 1).join('\n')
      const markedAsAntiPattern = /反模式|不要|错误|不推荐/.test(nearby)
      if (!markedAsAntiPattern) {
        issues.push({
          file,
          line: i + 1,
          message: 'Controller 推荐命名函数导出；如需展示 class 写法，必须明确标记为反模式',
        })
      }
    }
  }
  return issues
})

rule('G04', '文档不应使用过期的 Domain 绝对化描述', (_ctx) => {
  const issues = []
  const markdownFiles = [
    ...globSync('docs/**/*.md', ROOT),
    ...globSync('.agents/skills/**/*.md', ROOT),
    path.join(ROOT, 'readme.md'),
    path.join(ROOT, 'AGENTS.md'),
  ].filter(file => fs.existsSync(file))

  const stalePatterns = [
    /业务逻辑层 \(框架无关\)/,
    /框架无关，禁止 React/,
    /Domain 层框架无关/,
    /禁止导入任何 React/,
  ]

  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (stalePatterns.some(pattern => pattern.test(lines[i]))) {
        issues.push({
          file,
          line: i + 1,
          message: '请使用“Domain 核心逻辑框架无关，hooks.ts 为适配层例外”的表述',
        })
      }
    }
  }
  return issues
})

rule('G05', 'routing.yaml 应含 trigger_examples 字段', (_ctx) => {
  const issues = []
  const routingFiles = [
    ...globSync('.agents/skills/**/routing.yaml', ROOT),
    ...globSync('.agents/meta/**/routing.yaml', ROOT),
    ...globSync('apps/*/.agents/skills/**/routing.yaml', ROOT),
    ...globSync('packages/*/.agents/skills/**/routing.yaml', ROOT),
  ]
  for (const file of routingFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    if (!content.includes('trigger_examples')) {
      issues.push({
        file,
        line: 1,
        message: 'routing.yaml 应含 trigger_examples 字段（skill-based-arch 要求，提升 AI 匹配可靠性）',
      })
    }
  }
  return issues
})

rule('G06', '仅 project-architecture 应标记 primary: true', (_ctx) => {
  const issues = []
  function getFrontmatterPrimary(content) {
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!fmMatch)
      return null
    const fm = fmMatch[1]
    const primaryMatch = fm.match(/^primary:\s*(\S+)/m)
    return primaryMatch ? primaryMatch[1] : null
  }

  const primaryFile = path.join(ROOT, '.agents/skills/project-architecture/SKILL.md')
  if (fs.existsSync(primaryFile)) {
    const content = fs.readFileSync(primaryFile, 'utf-8')
    if (getFrontmatterPrimary(content) !== 'true') {
      issues.push({ file: primaryFile, line: 1, message: 'project-architecture 应标记 primary: true（默认 fallback skill）' })
    }
  }
  const allSkillFiles = [
    ...globSync('.agents/skills/**/SKILL.md', ROOT),
    ...globSync('.agents/meta/**/SKILL.md', ROOT),
    ...globSync('apps/*/.agents/skills/**/SKILL.md', ROOT),
    ...globSync('packages/*/.agents/skills/**/SKILL.md', ROOT),
  ]
  for (const file of allSkillFiles) {
    if (file === primaryFile)
      continue
    const content = fs.readFileSync(file, 'utf-8')
    if (getFrontmatterPrimary(content) === 'true') {
      issues.push({ file, line: 1, message: '仅 project-architecture 可标记 primary: true，其他 skill 不应标记' })
    }
  }
  return issues
})

// --------------------------------------------------
// 跨包依赖方向（单向依赖机器校验）
// --------------------------------------------------

rule('G07', '跨包依赖方向单向：packages/internal 不可依赖 apps，apps 间不可互相 import 源码', (_ctx) => {
  const issues = []

  function layerOf(rel) {
    const norm = rel.replace(/\\/g, '/')
    if (norm.startsWith('packages/'))
      return { kind: 'packages' }
    if (norm.startsWith('internal/'))
      return { kind: 'internal' }
    if (norm.startsWith('apps/'))
      return { kind: 'apps', app: norm.split('/')[1] }
    return null
  }

  function checkDirection(srcRel, targetRel) {
    const src = layerOf(srcRel)
    const tgt = layerOf(targetRel)
    if (!src || !tgt)
      return null
    if (src.kind === 'packages' && tgt.kind === 'apps')
      return '共享包不可依赖应用源码（packages → apps 违反单向依赖）'
    if (src.kind === 'internal' && (tgt.kind === 'apps' || tgt.kind === 'packages'))
      return 'internal 工具链配置不可依赖 apps/packages 源码'
    if (src.kind === 'apps' && tgt.kind === 'apps' && src.app !== tgt.app)
      return `应用之间不可互相依赖源码（${src.app} → ${tgt.app}）`
    return null
  }

  const sourceFiles = [
    ...globSync('packages/*/src/**/*.ts', ROOT),
    ...globSync('packages/*/src/**/*.tsx', ROOT),
    ...globSync('apps/*/src/**/*.ts', ROOT),
    ...globSync('apps/*/src/**/*.tsx', ROOT),
  ]

  const importRe = /import\s+(?:type\s+)?(?:[\w*$\s{},]+?\s+from\s+)?['"]([.][^'"]+)['"]/g

  for (const file of sourceFiles) {
    const srcRel = path.relative(ROOT, file)
    const content = fs.readFileSync(file, 'utf-8')
    let m
    while ((m = importRe.exec(content)) !== null) {
      const resolved = path.resolve(path.dirname(file), m[1])
      const targetRel = path.relative(ROOT, resolved)
      const msg = checkDirection(srcRel, targetRel)
      if (msg) {
        const line = content.slice(0, m.index).split('\n').length
        issues.push({ file, line, message: msg })
      }
    }
  }
  return issues
})

// --------------------------------------------------
// 先查后建：重复定义碰撞检测
// --------------------------------------------------

rule('C01', '同一 package 内不应有同名导出碰撞', (_ctx) => {
  const issues = []
  const allFiles = globSync('packages/**/src/**/*.ts', ROOT)
  const pkgExports = new Map()
  const conventionNames = new Set(['service', 'Controller'])
  for (const file of allFiles) {
    if (file.endsWith('.test.ts') || file.endsWith('index.ts'))
      continue
    const match = file.match(/packages\/([^/]+)\/src\//)
    if (!match)
      continue
    const pkgName = match[1]
    if (!pkgExports.has(pkgName))
      pkgExports.set(pkgName, new Map())
    const exportMap = pkgExports.get(pkgName)

    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const exportMatch = lines[i].match(/^\s*export\s+(?:const|function|class)\s+(\w+)/)
      if (exportMatch) {
        const name = exportMatch[1]
        if (conventionNames.has(name))
          continue
        if (!exportMap.has(name))
          exportMap.set(name, [])
        exportMap.get(name).push({ file, line: i + 1 })
      }
    }
  }
  for (const [, exportMap] of pkgExports) {
    for (const [name, occurrences] of exportMap) {
      if (occurrences.length > 1) {
        for (const occ of occurrences) {
          issues.push({
            file: occ.file,
            line: occ.line,
            message: `导出名 '${name}' 在同一 package 内碰撞：${occurrences.filter(o => o.file !== occ.file).map(o => path.relative(ROOT, o.file)).join(', ')}。先检索已有定义，避免重复`,
          })
        }
      }
    }
  }
  return issues
})

rule('C02', 'packages 内不应有跨模块同名导出碰撞', (_ctx) => {
  const issues = []
  const moduleDirs = globSync('packages/**/src/*', ROOT)
  const exportNames = new Map()
  for (const moduleDir of moduleDirs) {
    const files = globSync(`${path.relative(ROOT, moduleDir)}/**/*.ts`.replace(/\\/g, '/'), ROOT)
    for (const file of files) {
      if (file.endsWith('.test.ts') || file.endsWith('index.ts') || file.endsWith('type.ts'))
        continue
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^\s*export\s+(?:async\s+)?(?:function|const)\s+(\w+)/)
        if (match) {
          const name = match[1]
          if (!exportNames.has(name))
            exportNames.set(name, [])
          exportNames.get(name).push({ file, line: i + 1 })
        }
      }
    }
  }
  for (const [name, occurrences] of exportNames) {
    if (occurrences.length > 1) {
      for (const occ of occurrences) {
        issues.push({
          file: occ.file,
          line: occ.line,
          message: `导出名 '${name}' 与其他模块碰撞：${occurrences.filter(o => o.file !== occ.file).map(o => path.relative(ROOT, o.file)).join(', ')}。先检索已有定义，避免重复`,
        })
      }
    }
  }
  return issues
})

// ============================================================
// 工具函数
// ============================================================

function globSync(pattern, cwd) {
  const results = []

  const starIdx = pattern.indexOf('**')

  let exts = []
  if (starIdx >= 0) {
    const after = pattern.slice(starIdx + 2)
    const extPart = after.replace(/^\//, '')
    if (extPart.includes('*')) {
      const baseExt = extPart.replace(/\*/g, '')
      if (baseExt === '.ts') {
        exts = ['.ts']
      }
      else if (baseExt === '.tsx') {
        exts = ['.tsx']
      }
      else if (baseExt.startsWith('.')) {
        exts = [baseExt]
      }
      else {
        exts = ['.ts', '.tsx']
      }
    }
    else {
      exts = [extPart]
    }
  }
  else {
    exts = [path.extname(pattern)]
  }

  const basePartRaw = starIdx >= 0
    ? pattern.slice(0, starIdx).replace(/\/$/, '')
    : path.dirname(pattern)

  function expandBaseDirs(baseRel) {
    const segments = baseRel.split('/')
    const resolved = [path.join(cwd)]
    for (const seg of segments) {
      if (!seg)
        continue
      if (seg === '*') {
        const next = []
        for (const parent of resolved) {
          if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory())
            continue
          for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
            if (entry.isDirectory())
              next.push(path.join(parent, entry.name))
          }
        }
        resolved.length = 0
        resolved.push(...next)
      }
      else {
        for (let i = 0; i < resolved.length; i++)
          resolved[i] = path.join(resolved[i], seg)
      }
    }
    return resolved.filter(d => fs.existsSync(d) && fs.statSync(d).isDirectory())
  }

  const baseDirs = starIdx >= 0 ? expandBaseDirs(basePartRaw) : [path.join(cwd, basePartRaw)].filter(d => fs.existsSync(d))

  function walk(dir) {
    if (!fs.existsSync(dir))
      return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      }
      else if (entry.isFile() && exts.some(e => fullPath.endsWith(e))) {
        results.push(fullPath)
      }
    }
  }

  for (const baseDir of baseDirs) walk(baseDir)
  return results
}

// ============================================================
// 主逻辑
// ============================================================

function run() {
  const singleFile = process.argv[2]

  const ctx = {}

  console.log(c.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log(c.bold('  架构规范校验'))
  console.log(c.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log()

  let totalIssues = 0
  let passedRules = 0
  let failedRules = 0

  for (const ruleDef of rules) {
    let issues = []
    try {
      issues = ruleDef.checkFn(ctx)
    }
    catch (err) {
      issues.push({ file: 'N/A', line: 0, message: `规则执行出错: ${err.message}` })
    }

    if (singleFile) {
      issues = issues.filter(i => i.file === singleFile || i.file.endsWith(singleFile))
    }

    if (issues.length === 0) {
      console.log(c.green(`  [PASS] ${ruleDef.id}`) + c.gray(`  ${ruleDef.message}`))
      passedRules++
    }
    else {
      console.log(c.red(`  [FAIL] ${ruleDef.id}`) + c.gray(`  ${ruleDef.message}`))
      for (const issue of issues) {
        const relFile = path.relative(ROOT, issue.file)
        console.log(`         ${c.yellow(relFile)}:${issue.line}  ${issue.message}`)
      }
      totalIssues += issues.length
      failedRules++
    }
  }

  console.log()
  console.log(c.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))

  if (totalIssues === 0) {
    console.log(c.green(`  全部通过  ${passedRules}/${rules.length} 条规则`))
    console.log(c.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    process.exit(0)
  }
  else {
    console.log(c.red(`  发现 ${totalIssues} 个问题  ${failedRules} 条规则未通过  ${passedRules} 条通过`))
    console.log(c.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    process.exit(1)
  }
}

run()
