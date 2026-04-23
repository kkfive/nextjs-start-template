#!/usr/bin/env node
/**
 * Domain 层规范校验脚本
 *
 * 用于校验 AI 生成的代码是否符合项目规范。
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
// Domain 层：类型文件规范
// --------------------------------------------------

rule('D01', 'Domain 类型文件后缀应为 .ts（非 .d.ts）', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    if (file.endsWith('/type.d.ts')) {
      issues.push({ file, line: 1, message: '类型文件应重命名为 type.ts，使用 export type 导出' })
    }
  }
  return issues
})

rule('D02', 'Domain 类型文件不应使用 declare namespace', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    if (!file.includes('/type'))
      continue
    const content = fs.readFileSync(file, 'utf-8')
    if (content.includes('declare namespace')) {
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('declare namespace')) {
          issues.push({ file, line: i + 1, message: '应使用 export type 替代 declare namespace' })
        }
      }
    }
  }
  return issues
})

rule('D03', 'Domain index.ts 应包含 export type * from "./type"', (ctx) => {
  const issues = []
  for (const moduleDir of ctx.domainModules) {
    const indexFile = path.join(moduleDir, 'index.ts')
    if (!fs.existsSync(indexFile))
      continue
    const content = fs.readFileSync(indexFile, 'utf-8')
    if (!content.includes('export type * from \'./type\'') && !content.includes('export type * from "./type"')) {
      // 如果 type.ts/type.d.ts 存在但未导出类型
      const hasTypeFile = fs.existsSync(path.join(moduleDir, 'type.ts'))
        || fs.existsSync(path.join(moduleDir, 'type.d.ts'))
      if (hasTypeFile) {
        issues.push({ file: indexFile, line: 1, message: 'index.ts 应包含 export type * from "./type"' })
      }
    }
  }
  return issues
})

// --------------------------------------------------
// Domain 层：Controller 规范
// --------------------------------------------------

rule('D04', 'Controller 应使用命名导出函数（非 class）', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    if (!file.endsWith('/controller.ts'))
      continue
    const content = fs.readFileSync(file, 'utf-8')
    if (content.includes('export class Controller')) {
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('export class Controller')) {
          issues.push({
            file,
            line: i + 1,
            message: 'Controller 应使用命名导出函数（export async function getData），而非 class',
          })
        }
      }
    }
  }
  return issues
})

rule('D05', 'Controller / Service 第一个参数类型应为 HttpService', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    if (!file.endsWith('/controller.ts') && !file.endsWith('/service.ts'))
      continue
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // 匹配 async function xxx(client: HttpService ...)
      // 或 async function xxx(http: HttpService ...)
      const match = line.match(/(?:export\s+)?(?:async\s+)?function\s+\w+\s*\(\s*(\w+)\s*:/)
      if (match) {
        const firstParam = match[1]
        const afterColon = line.slice(line.indexOf(':') + 1).trim()
        if (!afterColon.startsWith('HttpService')) {
          issues.push({
            file,
            line: i + 1,
            message: `第一个参数 '${firstParam}' 类型应为 HttpService（依赖注入规范）`,
          })
        }
      }
    }
  }
  return issues
})

// --------------------------------------------------
// Domain 层：类型安全
// --------------------------------------------------

rule('D06', 'Domain 层不应包含 @ts-expect-error', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('@ts-expect-error')) {
        issues.push({ file, line: i + 1, message: 'Domain 层不应使用 @ts-expect-error 绕过类型检查' })
      }
    }
  }
  return issues
})

rule('D07', 'Domain 层不应包含 any 类型', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    if (file.endsWith('.test.ts'))
      continue // 测试文件允许
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // 排除注释行和 import 行中的 any（如 Promise<any> 来自外部库）
      if (line.trim().startsWith('//') || line.trim().startsWith('*'))
        continue
      if (line.includes('import '))
        continue
      // 匹配 : any, | any, as any 等模式
      if (/:\s*any\b/.test(line) || /\|\s*any\b/.test(line) || /as\s+any\b/.test(line)) {
        issues.push({ file, line: i + 1, message: `包含 any 类型: ${line.trim()}` })
      }
    }
  }
  return issues
})

// --------------------------------------------------
// Domain 层：hooks.ts 规范
// --------------------------------------------------

rule('D08', '有数据获取需求的模块应包含 hooks.ts', (ctx) => {
  const issues = []
  for (const moduleDir of ctx.domainModules) {
    const hasController = fs.existsSync(path.join(moduleDir, 'controller.ts'))
    const hasService = fs.existsSync(path.join(moduleDir, 'service.ts'))
    const hasHooks = fs.existsSync(path.join(moduleDir, 'hooks.ts'))
    if ((hasController || hasService) && !hasHooks) {
      // forms/contact 等纯表单模块不需要 hooks
      const moduleName = path.basename(moduleDir)
      if (moduleName === 'contact' || moduleName === 'schema')
        continue
      issues.push({
        file: path.join(moduleDir, 'hooks.ts'),
        line: 1,
        message: '该模块包含 Controller/Service，建议添加 hooks.ts 封装 React Query',
      })
    }
  }
  return issues
})

rule('D09', 'hooks.ts 应从 @/service/index.client 导入 httpClient', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    if (!file.endsWith('/hooks.ts'))
      continue
    const content = fs.readFileSync(file, 'utf-8')
    if (!content.includes('@/service/index.client')) {
      issues.push({
        file,
        line: 1,
        message: 'hooks.ts 应从 @/service/index.client 导入 httpClient（而非创建新实例）',
      })
    }
  }
  return issues
})

// --------------------------------------------------
// Domain 层：api.ts 规范
// --------------------------------------------------

rule('D10', 'api.ts 应使用命名导出（非 default export）', (ctx) => {
  const issues = []
  for (const file of ctx.domainFiles) {
    if (!file.endsWith('/api.ts') && !file.includes('/const/api.ts'))
      continue
    const content = fs.readFileSync(file, 'utf-8')
    if (content.includes('export default')) {
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('export default')) {
          issues.push({
            file,
            line: i + 1,
            message: 'api.ts 应使用命名导出（export const getData = { ... }），便于 tree-shaking 和类型推导',
          })
        }
      }
    }
  }
  return issues
})

// --------------------------------------------------
// UI 层规范
// --------------------------------------------------

rule('U01', 'UI 组件不应直接导入 @domain/.../controller', (_ctx) => {
  const issues = []
  const uiFiles = globSync('src/components/**/*.ts*', ROOT)
  const appFiles = globSync('src/app/**/*.ts*', ROOT)
  for (const file of [...uiFiles, ...appFiles]) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // 匹配 import { Controller } from '@domain/xxx/controller' 或 '@domain/xxx/service'
      const match = line.match(/from\s+['"]@domain\/[^'"]+\/(controller|service)['"]/)
      if (match) {
        issues.push({
          file,
          line: i + 1,
          message: `应通过 index.ts 导入（import { Controller } from '@domain/xxx'），而非直接导入 /${match[1]}`,
        })
      }
    }
  }
  return issues
})

rule('U02', 'UI 组件（domain 相关）不应包含 any 类型', (_ctx) => {
  const issues = []
  const domainUiFiles = globSync('src/components/domain/**/*.ts*', ROOT)
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
// src/lib/request/ 规范
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
  const serviceFiles = globSync('src/service/**/*.ts', ROOT)
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
  const file = path.join(ROOT, 'src/lib/request/type.ts')
  if (fs.existsSync(file)) {
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
// Domain 层：文件结构完整性
// --------------------------------------------------

rule('D11', 'domain 模块文件结构应完整（type.ts, const/api.ts, service.ts, controller.ts, index.ts）', (ctx) => {
  const issues = []
  const requiredFiles = ['index.ts']
  for (const moduleDir of ctx.domainModules) {
    const moduleName = path.basename(moduleDir)
    // 跳过特殊目录
    if (moduleName.startsWith('_'))
      continue
    for (const req of requiredFiles) {
      if (!fs.existsSync(path.join(moduleDir, req))) {
        issues.push({
          file: path.join(moduleDir, req),
          line: 1,
          message: `缺少必需文件 ${req}`,
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

  // 解析 pattern: "domain/**/*.ts" => base="domain", exts=[".ts"]
  // 或 "src/components/domain/**/*.ts*" => base="src/components/domain", exts=[".ts", ".tsx"]
  const starIdx = pattern.indexOf('**')
  const baseDir = starIdx >= 0
    ? path.join(cwd, pattern.slice(0, starIdx).replace(/\/$/, ''))
    : path.join(cwd, path.dirname(pattern))

  let exts = []
  if (starIdx >= 0) {
    const after = pattern.slice(starIdx + 2) // e.g. "/**/*.ts" -> "/*.ts" or "/**/*.ts*"
    const extPart = after.replace(/^\//, '')
    if (extPart.includes('*')) {
      // e.g. "*.ts*" => .ts, .tsx
      const baseExt = extPart.replace(/\*/g, '')
      if (baseExt === '.ts') {
        exts = ['.ts']
      }
      else if (baseExt === '.tsx') {
        exts = ['.tsx']
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

  walk(baseDir)
  return results
}

function getDomainModules() {
  const domainDir = path.join(ROOT, 'domain')
  if (!fs.existsSync(domainDir))
    return []
  const modules = []
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        // 如果目录下包含 service.ts 或 controller.ts，认为是一个模块
        const hasCode = fs.existsSync(path.join(fullPath, 'service.ts'))
          || fs.existsSync(path.join(fullPath, 'controller.ts'))
          || fs.existsSync(path.join(fullPath, 'schema.ts'))
        if (hasCode) {
          modules.push(fullPath)
        }
        else {
          walk(fullPath)
        }
      }
    }
  }
  walk(domainDir)
  return modules
}

function getDomainFiles() {
  return globSync('domain/**/*.ts', ROOT).filter(f => !f.endsWith('.test.ts'))
}

// ============================================================
// 主逻辑
// ============================================================

function run() {
  const singleFile = process.argv[2]

  const ctx = {
    domainModules: getDomainModules(),
    domainFiles: getDomainFiles(),
  }

  console.log(c.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log(c.bold('  Domain 规范校验'))
  console.log(c.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log()
  console.log(`${c.gray('Domain 模块:')} ${ctx.domainModules.length} 个`)
  console.log(`${c.gray('Domain 文件:')} ${ctx.domainFiles.length} 个`)
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
