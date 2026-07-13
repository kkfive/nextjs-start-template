import fs from 'node:fs'
import path from 'node:path'
import type { ImportReference } from '../parser.ts'
import { collectImportReferences, readSourceFile } from '../parser.ts'
import type { ArchitecturePolicyContext, ArchitecturePolicyIssue } from '../types.ts'

export function relative(context: ArchitecturePolicyContext, file: string): string {
  return path.relative(context.rootDir, file).split(path.sep).join('/')
}

export function issue(ruleId: string, file: string, line: number, message: string): ArchitecturePolicyIssue {
  return { ruleId, file, line, message }
}

export function sourceFiles(context: ArchitecturePolicyContext): string[] {
  return context.files.filter(file => file !== path.join(context.rootDir, 'package.json') && !file.endsWith('/package.json'))
}

export function importsOf(file: string): ImportReference[] {
  const sourceFile = readSourceFile(file)
  return sourceFile ? collectImportReferences(sourceFile) : []
}

export function targetPath(context: ArchitecturePolicyContext, file: string, specifier: string): string | undefined {
  if (specifier.startsWith('.'))
    return path.relative(context.rootDir, path.resolve(path.dirname(file), specifier)).split(path.sep).join('/')
  if (specifier.startsWith('@/')) {
    const app = relative(context, file).match(/^apps\/([^/]+)\/src\//)?.[1]
    return app ? `apps/${app}/src/${specifier.slice(2)}` : undefined
  }
  return workspacePackagePath(context, specifier)
}

export function workspacePackagePath(context: ArchitecturePolicyContext, packageName: string): string | undefined {
  for (const file of packageJsonFiles(context)) {
    const manifest = readJson(file)
    if (manifest?.name === packageName)
      return relative(context, path.dirname(file))
  }
  return undefined
}

export function packageJsonFiles(context: ArchitecturePolicyContext): string[] {
  return context.files.filter(file => path.basename(file) === 'package.json')
}

export function readJson(file: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>
  }
  catch {
    return undefined
  }
}
