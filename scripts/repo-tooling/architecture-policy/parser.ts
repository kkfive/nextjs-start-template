import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

export type ImportReference = {
  specifier: string
  line: number
  isTypeOnly: boolean
  kind: 'import' | 'export' | 'import-type' | 'dynamic-import' | 'require'
  importedNames: string[]
}

const sourceExtensions = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'])
const ignoredDirectories = new Set(['.git', '.next', '.turbo', '.workflow', 'coverage', 'dist', 'node_modules'])

export function collectPolicyFiles(rootDir: string): string[] {
  const files: string[] = []

  function walk(directory: string) {
    if (!fs.existsSync(directory))
      return
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name))
          walk(path.join(directory, entry.name))
        continue
      }
      if (!entry.isFile())
        continue
      const relative = path.relative(rootDir, path.join(directory, entry.name)).split(path.sep).join('/')
      if (relative.includes('/__fixtures__/'))
        continue
      if (sourceExtensions.has(path.extname(entry.name)) || entry.name === 'package.json')
        files.push(path.join(directory, entry.name))
    }
  }

  walk(rootDir)
  return files.sort()
}

export function readSourceFile(file: string): ts.SourceFile | undefined {
  try {
    return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, scriptKind(file))
  }
  catch {
    return undefined
  }
}

export function collectImportReferences(sourceFile: ts.SourceFile): ImportReference[] {
  const references: ImportReference[] = []
  const lineOf = (node: ts.Node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
  const add = (specifier: ts.Expression | ts.TypeNode, kind: ImportReference['kind'], isTypeOnly: boolean, importedNames: string[] = []) => {
    const expression = ts.isLiteralTypeNode(specifier) ? specifier.literal : specifier
    if (ts.isStringLiteralLike(expression))
      references.push({ specifier: expression.text, line: lineOf(expression), isTypeOnly, kind, importedNames })
  }

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      const clause = node.importClause
      const isTypeOnly = Boolean(clause?.isTypeOnly)
        || Boolean(clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
          && clause.namedBindings.elements.length > 0
          && clause.namedBindings.elements.every(element => element.isTypeOnly))
      const importedNames = [
        ...(clause?.name ? [clause.name.text] : []),
        ...(clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
          ? clause.namedBindings.elements.map(element => element.name.text)
          : []),
      ]
      add(node.moduleSpecifier, 'import', isTypeOnly, importedNames)
    }
    else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      add(node.moduleSpecifier, 'export', Boolean(node.isTypeOnly))
    }
    else if (ts.isImportTypeNode(node)) {
      add(node.argument, 'import-type', true, node.qualifier && ts.isIdentifier(node.qualifier) ? [node.qualifier.text] : [])
    }
    else if (ts.isCallExpression(node)) {
      const [argument] = node.arguments
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && argument && ts.isStringLiteralLike(argument))
        add(argument, 'dynamic-import', false)
      if (ts.isIdentifier(node.expression) && node.expression.text === 'require' && argument && ts.isStringLiteralLike(argument))
        add(argument, 'require', false)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return references
}

function scriptKind(file: string): ts.ScriptKind {
  if (file.endsWith('.tsx') || file.endsWith('.jsx'))
    return ts.ScriptKind.TSX
  if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'))
    return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}
