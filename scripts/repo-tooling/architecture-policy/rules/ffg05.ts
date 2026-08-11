import type { ArchitecturePolicy } from '../types.ts'
import { isAllowedAppTypeImport, isAllowedAppTypeManifest } from './app-type-consumer.ts'
import { importsOf, issue, packageJsonFiles, readJson, relative, sourceFiles, targetPath } from './helpers.ts'

function directionViolation(source: string, target: string, appTypeBridgeAllowed: boolean): string | undefined {
  if (appTypeBridgeAllowed)
    return undefined
  const sourceApp = source.match(/^apps\/([^/]+)/)?.[1]
  const targetApp = target.match(/^apps\/([^/]+)/)?.[1]
  if (source.startsWith('packages/') && target.startsWith('apps/')) {
    if (source.startsWith('packages/rpc/') && target.startsWith('apps/api') && appTypeBridgeAllowed)
      return undefined
    return 'packages 不得依赖 apps'
  }
  if (source.startsWith('internal/') && (target.startsWith('apps/') || target.startsWith('packages/')))
    return 'internal 不得依赖 apps 或 packages'
  if (sourceApp && targetApp && sourceApp !== targetApp)
    return 'apps 之间不得相互依赖'
  return undefined
}

export const ffg05: ArchitecturePolicy = {
  id: 'FFG05',
  message: 'monorepo 依赖必须单向：packages/internal 不依赖 apps，apps 互不依赖',
  check(context) {
    const issues = []
    for (const file of sourceFiles(context)) {
      const source = relative(context, file)
      for (const reference of importsOf(file)) {
        const target = targetPath(context, file, reference.specifier)
        const appTypeBridgeAllowed = Boolean(target?.startsWith('apps/api'))
          && isAllowedAppTypeImport(source, reference)
        const message = target && directionViolation(source, target, appTypeBridgeAllowed)
        if (message)
          issues.push(issue('FFG05', file, reference.line, message))
      }
    }
    for (const file of packageJsonFiles(context)) {
      const source = relative(context, file)
      const manifest = readJson(file)
      if (!manifest)
        continue
      for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const) {
        const dependencies = manifest[key]
        if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies))
          continue
        for (const [dependency, specifier] of Object.entries(dependencies as Record<string, string>)) {
          const target = targetPath(context, file, dependency)
          const appTypeBridgeAllowed = Boolean(target?.startsWith('apps/api'))
            && isAllowedAppTypeManifest(source, key, dependency, specifier)
          const message = target && directionViolation(source, target, appTypeBridgeAllowed)
          if (message)
            issues.push(issue('FFG05', file, 1, message))
        }
      }
    }
    return issues
  },
}
