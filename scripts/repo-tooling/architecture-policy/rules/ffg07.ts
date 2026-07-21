import type { ArchitecturePolicy } from '../types.ts'
import ts from 'typescript'
import { readSourceFile } from '../parser.ts'
import { importsOf, issue, relative, sourceFiles } from './helpers.ts'

const requiredApiImportPatterns = [
  '@/components/*',
  '@/service/*',
  '@kkfive/utils/dom',
  'react',
  'react-dom',
  'next/*',
] as const

type RestrictionState = {
  status: 'enabled' | 'disabled' | 'missing'
  patterns: Set<string>
  line: number
}

function propertyName(node: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node))
    return node.text
  return undefined
}

function lineOf(source: ts.SourceFile, node: ts.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
}

function restrictionPatterns(initializer: ts.Expression): Set<string> {
  const patterns = new Set<string>()
  if (!ts.isArrayLiteralExpression(initializer))
    return patterns

  for (const element of initializer.elements.slice(1)) {
    if (!ts.isObjectLiteralExpression(element))
      continue
    const property = element.properties.find(candidate => (
      ts.isPropertyAssignment(candidate) && propertyName(candidate.name) === 'patterns'
    ))
    if (!property || !ts.isPropertyAssignment(property) || !ts.isArrayLiteralExpression(property.initializer))
      continue
    for (const pattern of property.initializer.elements) {
      if (ts.isStringLiteralLike(pattern))
        patterns.add(pattern.text)
    }
  }
  return patterns
}

function restrictionState(source: ts.SourceFile): RestrictionState {
  let state: RestrictionState = { status: 'missing', patterns: new Set(), line: 1 }

  function hasApiScope(node: ts.Node): boolean {
    let current: ts.Node | undefined = node
    while (current) {
      if (ts.isObjectLiteralExpression(current)) {
        const files = current.properties.find(property => (
          ts.isPropertyAssignment(property) && propertyName(property.name) === 'files'
        ))
        if (files && ts.isPropertyAssignment(files) && files.initializer.getText(source).includes('apps/api/'))
          return true
      }
      current = current.parent
    }
    return false
  }

  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node)
      && propertyName(node.name) === 'no-restricted-imports'
      && hasApiScope(node)) {
      const initializer = node.initializer
      const first = ts.isArrayLiteralExpression(initializer) ? initializer.elements[0] : initializer
      if (ts.isStringLiteralLike(first) && first.text === 'off')
        state = { status: 'disabled', patterns: new Set(), line: lineOf(source, node) }
      else if (ts.isNumericLiteral(first) && first.text === '0')
        state = { status: 'disabled', patterns: new Set(), line: lineOf(source, node) }
      else
        state = { status: 'enabled', patterns: restrictionPatterns(initializer), line: lineOf(source, node) }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return state
}

function matchesRestrictedPattern(specifier: string, pattern: string): boolean {
  if (pattern.endsWith('/*'))
    return specifier.startsWith(pattern.slice(0, -1))
  return specifier === pattern
}

export const ffg07: ArchitecturePolicy = {
  id: 'FFG07',
  message: 'apps/api 的 no-restricted-imports 必须启用，且不得使用受限前端或 DOM import',
  check(context) {
    const issues = []
    const config = context.files.find(file => relative(context, file) === 'eslint.config.js')
    if (!config) {
      issues.push(issue('FFG07', `${context.rootDir}/eslint.config.js`, 1, '根 ESLint 配置必须为 apps/api 启用 no-restricted-imports'))
    }
    else {
      const source = readSourceFile(config)
      const state = source ? restrictionState(source) : { status: 'missing' as const, patterns: new Set<string>(), line: 1 }
      if (state.status !== 'enabled') {
        issues.push(issue('FFG07', config, state.line, 'apps/api 作用域的 no-restricted-imports 必须保持启用，不能被 override 关闭'))
      }
      else {
        const missingPatterns = requiredApiImportPatterns.filter(pattern => !state.patterns.has(pattern))
        if (missingPatterns.length > 0)
          issues.push(issue('FFG07', config, state.line, `apps/api 的 no-restricted-imports 缺少 required patterns: ${missingPatterns.join(', ')}`))
      }
    }
    for (const file of sourceFiles(context)) {
      if (!relative(context, file).startsWith('apps/api/src/'))
        continue
      for (const reference of importsOf(file)) {
        if (requiredApiImportPatterns.some(pattern => matchesRestrictedPattern(reference.specifier, pattern)))
          issues.push(issue('FFG07', file, reference.line, `apps/api 不得导入受限模块 ${reference.specifier}`))
      }
    }
    return issues
  },
}
