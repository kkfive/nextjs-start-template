import type { ArchitecturePolicy } from '../types.ts'
import ts from 'typescript'
import { readSourceFile } from '../parser.ts'
import { importsOf, issue, relative, sourceFiles } from './helpers.ts'

const legacySpecifier = /^@domain(?:\/|$)|^@kkfive\/domain-core(?:\/|$)/
const appSource = /^apps\/[^/]+\/src\//

function isUiDependency(specifier: string): boolean {
  return specifier === '@kkfive/ui' || specifier.startsWith('@kkfive/ui/') || specifier === 'antd'
}

function lineOf(source: ts.SourceFile, node: ts.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
}

function importedUiBindings(source: ts.SourceFile): Map<string, string> {
  const bindings = new Map<string, string>()

  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteralLike(statement.moduleSpecifier))
      continue
    const specifier = statement.moduleSpecifier.text
    if (!isUiDependency(specifier) || !statement.importClause)
      continue

    if (statement.importClause.name)
      bindings.set(statement.importClause.name.text, specifier)

    const namedBindings = statement.importClause.namedBindings
    if (namedBindings && ts.isNamespaceImport(namedBindings))
      bindings.set(namedBindings.name.text, specifier)
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements)
        bindings.set(element.name.text, specifier)
    }
  }

  return bindings
}

function uiPassthroughIssues(file: string, source: ts.SourceFile) {
  const issues = []
  const importedBindings = importedUiBindings(source)

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)
      && statement.moduleSpecifier
      && ts.isStringLiteralLike(statement.moduleSpecifier)
      && isUiDependency(statement.moduleSpecifier.text)) {
      issues.push(issue('FFG04', file, lineOf(source, statement), `不得直接透传 UI 依赖 ${statement.moduleSpecifier.text}`))
      continue
    }

    if (ts.isExportDeclaration(statement)
      && !statement.moduleSpecifier
      && statement.exportClause
      && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        const localName = element.propertyName?.text ?? element.name.text
        const specifier = importedBindings.get(localName)
        if (specifier)
          issues.push(issue('FFG04', file, lineOf(source, element), `不得原样导出从 ${specifier} 导入的 binding ${localName}`))
      }
    }

    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression)) {
      const specifier = importedBindings.get(statement.expression.text)
      if (specifier)
        issues.push(issue('FFG04', file, lineOf(source, statement), `不得原样 default export 从 ${specifier} 导入的 binding ${statement.expression.text}`))
    }
  }

  return issues
}

export const ffg04: ArchitecturePolicy = {
  id: 'FFG04',
  message: '不得建立兼容层、re-export 透传、旧 alias 或回退导入',
  check(context) {
    const issues = []
    for (const file of sourceFiles(context)) {
      for (const reference of importsOf(file)) {
        if (legacySpecifier.test(reference.specifier))
          issues.push(issue('FFG04', file, reference.line, '不得使用已删除的 Domain alias 或 domain-core 包'))
        if (reference.kind === 'export' && reference.specifier.startsWith('@/features/'))
          issues.push(issue('FFG04', file, reference.line, '不得以 re-export 透传 feature 公开入口建立兼容层'))
      }

      if (!appSource.test(relative(context, file)))
        continue
      const source = readSourceFile(file)
      if (source)
        issues.push(...uiPassthroughIssues(file, source))
    }
    return issues
  },
}
