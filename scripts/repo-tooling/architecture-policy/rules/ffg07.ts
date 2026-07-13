import ts from 'typescript'
import type { ArchitecturePolicy } from '../types.ts'
import { importsOf, issue, relative, sourceFiles } from './helpers.ts'
import { readSourceFile } from '../parser.ts'

const restrictedApiImports = ['@kkfive/utils/dom', 'react', 'react-dom']

function propertyName(node: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node))
    return node.text
  return undefined
}

function restrictionState(source: ts.SourceFile): 'enabled' | 'disabled' | 'missing' {
  let state: 'enabled' | 'disabled' | 'missing' = 'missing'

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
        state = 'disabled'
      else if (ts.isNumericLiteral(first) && first.text === '0')
        state = 'disabled'
      else
        state = 'enabled'
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return state
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
      const state = source ? restrictionState(source) : 'missing'
      if (state !== 'enabled')
        issues.push(issue('FFG07', config, 1, 'apps/api 作用域的 no-restricted-imports 必须保持启用，不能被 override 关闭'))
    }
    for (const file of sourceFiles(context)) {
      if (!relative(context, file).startsWith('apps/api/src/'))
        continue
      for (const reference of importsOf(file)) {
        if (restrictedApiImports.some(prefix => reference.specifier === prefix || reference.specifier.startsWith(`${prefix}/`)))
          issues.push(issue('FFG07', file, reference.line, `apps/api 不得导入受限模块 ${reference.specifier}`))
      }
    }
    return issues
  },
}
