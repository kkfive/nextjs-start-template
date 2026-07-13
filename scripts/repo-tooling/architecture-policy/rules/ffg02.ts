import ts from 'typescript'
import type { ArchitecturePolicy } from '../types.ts'
import { issue, relative } from './helpers.ts'
import { readSourceFile } from '../parser.ts'

const routeFile = /\/src\/app\/(?:.*\/)?(?:page|layout)\.tsx?$/

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
      const issues = []
      for (const statement of sourceFile.statements) {
        const isDefaultExport = Boolean(ts.canHaveModifiers(statement)
          && ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword))
        if (ts.isFunctionDeclaration(statement) && !isDefaultExport && statement.name && /^[A-Z]/.test(statement.name.text)) {
          issues.push(issue('FFG02', file, sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile)).line + 1, '路由文件不得定义额外业务或可复用组件函数'))
        }
      }
      function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'fetch')
          issues.push(issue('FFG02', file, sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1, '路由文件不得直接发起请求 call'))
        ts.forEachChild(node, visit)
      }
      ts.forEachChild(sourceFile, visit)
      return issues
    })
  },
}
