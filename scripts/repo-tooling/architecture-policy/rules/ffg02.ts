import type { ArchitecturePolicy, ArchitecturePolicyContext, ArchitecturePolicyIssue } from '../types.ts'
import ts from 'typescript'
import { readSourceFile } from '../parser.ts'
import { issue, relative, targetPath } from './helpers.ts'

const routeFile = /\/src\/app\/(?:.*\/)?(?:page|layout)\.tsx?$/
const clientStateHooks = new Set([
  'useEffect',
  'useLayoutEffect',
  'useReducer',
  'useState',
  'useSyncExternalStore',
])

type ImportBinding = {
  importedName: string
  source: string
}

function importBindings(sourceFile: ts.SourceFile): Map<string, ImportBinding> {
  const bindings = new Map<string, ImportBinding>()

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause || !ts.isStringLiteralLike(statement.moduleSpecifier))
      continue
    const { importClause } = statement
    if (importClause.isTypeOnly)
      continue
    const source = statement.moduleSpecifier.text
    if (importClause.name)
      bindings.set(importClause.name.text, { importedName: 'default', source })
    if (importClause.namedBindings && ts.isNamespaceImport(importClause.namedBindings)) {
      bindings.set(importClause.namedBindings.name.text, { importedName: '*', source })
    }
    if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
      for (const element of importClause.namedBindings.elements) {
        if (!element.isTypeOnly) {
          bindings.set(element.name.text, {
            importedName: element.propertyName?.text ?? element.name.text,
            source,
          })
        }
      }
    }
  }

  return bindings
}

function isStableFeatureEntry(context: ArchitecturePolicyContext, file: string, specifier: string): boolean {
  if (!specifier.startsWith('@/features/'))
    return false
  const target = targetPath(context, file, specifier)
  if (!target)
    return false
  return context.files.some((candidate) => {
    const normalized = relative(context, candidate)
    return /\/index\.[cm]?[jt]sx?$/.test(normalized)
      && normalized.replace(/\/index\.[cm]?[jt]sx?$/, '') === target
  })
}

function rootIdentifier(expression: ts.Expression): ts.Identifier | undefined {
  let current = expression
  while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current))
    current = current.expression
  return ts.isIdentifier(current) ? current : undefined
}

export const ffg02: ArchitecturePolicy = {
  id: 'FFG02',
  message: 'page/layout 仅可组合 feature 入口、路由元数据与 Next.js 路由能力',
  check(context) {
    return context.files.flatMap((file) => {
      if (!routeFile.test(`/${relative(context, file)}`))
        return []
      const source = readSourceFile(file)
      if (!source)
        return []
      const sourceFile = source
      const bindings = importBindings(sourceFile)
      const issues: ArchitecturePolicyIssue[] = []
      const reported = new Set<string>()
      const lineOf = (node: ts.Node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
      const report = (node: ts.Node, message: string) => {
        const key = `${node.getStart(sourceFile)}:${message}`
        if (!reported.has(key)) {
          reported.add(key)
          issues.push(issue('FFG02', file, lineOf(node), message))
        }
      }

      for (const statement of sourceFile.statements) {
        if (ts.isExpressionStatement(statement)
          && ts.isStringLiteralLike(statement.expression)
          && statement.expression.text === 'use client') {
          report(statement, '路由 page/layout 必须保持为 Server Component，不得声明 use client')
        }
        if (ts.isImportDeclaration(statement) && ts.isStringLiteralLike(statement.moduleSpecifier)) {
          const specifier = statement.moduleSpecifier.text
          if (specifier === '@/service' || specifier.startsWith('@/service/'))
            report(statement.moduleSpecifier, '路由文件不得直接导入 src/service 运行时实例')
          if (specifier.startsWith('@/features/') && !isStableFeatureEntry(context, file, specifier))
            report(statement.moduleSpecifier, '路由文件只能从 feature 稳定入口导入，不得使用 deep import')
        }
        const isDefaultExport = Boolean(ts.canHaveModifiers(statement)
          && ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword))
        if (ts.isFunctionDeclaration(statement) && !isDefaultExport && statement.name && /^[A-Z]/.test(statement.name.text)) {
          report(statement, '路由文件不得定义额外业务或可复用组件函数')
        }
      }

      function visit(node: ts.Node) {
        if (ts.isCallExpression(node)) {
          if (ts.isIdentifier(node.expression)) {
            const binding = bindings.get(node.expression.text)
            if (binding?.source === 'react' && clientStateHooks.has(binding.importedName))
              report(node, `路由文件不得调用 React client state hook ${binding.importedName}`)
            if ((!binding && node.expression.text === 'fetch') || binding?.source === 'axios')
              report(node, '路由文件不得直接发起 fetch/axios 请求 call')
          }
          else if (ts.isPropertyAccessExpression(node.expression)) {
            const root = rootIdentifier(node.expression)
            const binding = root ? bindings.get(root.text) : undefined
            const calledName = node.expression.name.text
            if (binding?.source === 'react' && clientStateHooks.has(calledName))
              report(node, `路由文件不得调用 React client state hook ${calledName}`)
            if (binding?.source === 'axios'
              || (!binding && root && root.text === 'axios')
              || (!binding && root && (root.text === 'globalThis' || root.text === 'window') && calledName === 'fetch')) {
              report(node, '路由文件不得直接发起 fetch/axios 请求 call')
            }
          }
        }
        ts.forEachChild(node, visit)
      }
      ts.forEachChild(sourceFile, visit)
      return issues
    })
  },
}
