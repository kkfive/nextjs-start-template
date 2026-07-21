import type { ArchitecturePolicy, ArchitecturePolicyIssue } from '../types.ts'
import ts from 'typescript'
import { collectImportReferences, readSourceFile } from '../parser.ts'
import { isAllowedAppTypeImport } from './app-type-consumer.ts'
import { issue, relative } from './helpers.ts'

const runtimeBasenames = new Set([
  'http-client.ts',
  'http-server.ts',
  'rpc-client.ts',
  'rpc-server.ts',
  'sse-client.ts',
])
const testBasenames = new Set([...runtimeBasenames].map(basename => basename.replace(/\.ts$/, '.test.ts')))

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return Boolean(ts.canHaveModifiers(node) && ts.getModifiers(node)?.some(modifier => modifier.kind === kind))
}

function isBusinessVariable(declaration: ts.VariableDeclaration): boolean {
  if (!ts.isIdentifier(declaration.name))
    return true
  return /^use[A-Z0-9_]/u.test(declaration.name.text) || /(?:Store|Calls?)$/u.test(declaration.name.text)
}

function exportedBusinessIssues(file: string, sourceFile: ts.SourceFile): ArchitecturePolicyIssue[] {
  const issues: ArchitecturePolicyIssue[] = []
  const businessDeclarations = new Map<string, ts.Node>()
  const lineOf = (node: ts.Node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
  const report = (node: ts.Node) => {
    issues.push(issue('FFG03', file, lineOf(node), 'src/service 不得导出业务 function、class、hook、store 或 calls'))
  }

  for (const statement of sourceFile.statements) {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name)
      businessDeclarations.set(statement.name.text, statement)
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && isBusinessVariable(declaration))
          businessDeclarations.set(declaration.name.text, declaration)
      }
    }
  }

  for (const statement of sourceFile.statements) {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement))
      && hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      report(statement)
      continue
    }
    if ((ts.isEnumDeclaration(statement) || ts.isModuleDeclaration(statement))
      && hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      report(statement)
      continue
    }
    if (ts.isVariableStatement(statement) && hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of statement.declarationList.declarations) {
        if (isBusinessVariable(declaration))
          report(declaration)
      }
      continue
    }
    if (ts.isExportAssignment(statement)) {
      report(statement)
      continue
    }
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly)
      continue
    if (statement.moduleSpecifier) {
      report(statement)
      continue
    }
    if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) {
          const declaration = businessDeclarations.get(element.propertyName?.text ?? element.name.text)
          if (declaration)
            report(element)
        }
      }
    }
  }

  return issues
}

export const ffg03: ArchitecturePolicy = {
  id: 'FFG03',
  message: 'src/service 仅允许固定命名的 HTTP/RPC/SSE 运行时实例与环境边界',
  check(context) {
    return context.files.flatMap((file) => {
      const servicePath = relative(context, file).match(/^apps\/[^/]+\/src\/service\/(.+)$/u)?.[1]
      if (!servicePath)
        return []
      if (servicePath.includes('/'))
        return [issue('FFG03', file, 1, 'src/service 运行时文件必须直接放在 service 根目录，不得建立业务子目录')]
      if (!runtimeBasenames.has(servicePath) && !testBasenames.has(servicePath))
        return [issue('FFG03', file, 1, 'src/service 仅允许固定的 HTTP/RPC/SSE runtime 与同名 test 文件')]

      const sourceFile = readSourceFile(file)
      if (!sourceFile)
        return []
      const issues: ArchitecturePolicyIssue[] = []
      const lineOf = (node: ts.Node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1

      if (runtimeBasenames.has(servicePath)) {
        const expectedMarker = servicePath.includes('-client.') ? 'client-only' : 'server-only'
        const oppositeMarker = expectedMarker === 'client-only' ? 'server-only' : 'client-only'
        const markerImports = sourceFile.statements.flatMap((statement) => {
          if (!ts.isImportDeclaration(statement) || !ts.isStringLiteralLike(statement.moduleSpecifier))
            return []
          const specifier = statement.moduleSpecifier.text
          return specifier === 'client-only' || specifier === 'server-only'
            ? [{ specifier, statement }]
            : []
        })
        const oppositeImport = markerImports.find(marker => marker.specifier === oppositeMarker)
        if (oppositeImport) {
          issues.push(issue('FFG03', file, lineOf(oppositeImport.statement.moduleSpecifier), `${servicePath} 不得导入 opposite marker ${oppositeMarker}`))
        }
        else {
          const sideEffectMarker = markerImports.find(marker => (
            marker.specifier === expectedMarker && !marker.statement.importClause
          ))
          if (!sideEffectMarker) {
            const marker = markerImports.find(marker => marker.specifier === expectedMarker)
            issues.push(issue('FFG03', file, marker ? lineOf(marker.statement.moduleSpecifier) : 1, `${servicePath} 必须使用 side-effect import '${expectedMarker}'`))
          }
        }
      }

      const source = relative(context, file)
      for (const reference of collectImportReferences(sourceFile)) {
        if (reference.specifier === 'api' && !isAllowedAppTypeImport(source, reference))
          issues.push(issue('FFG03', file, reference.line, '只有 rpc-*.ts 可通过 import type 精确导入 api.AppType'))
      }

      issues.push(...exportedBusinessIssues(file, sourceFile))
      return issues
    })
  },
}
