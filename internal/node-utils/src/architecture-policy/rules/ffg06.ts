import type { ArchitecturePolicy } from '../types.ts'
import { importsOf, issue, relative, sourceFiles, targetPath } from './helpers.ts'

export const ffg06: ArchitecturePolicy = {
  id: 'FFG06',
  message: 'packages/rpc 对 apps/api 的唯一豁免仅限 AppType type-only import',
  check(context) {
    const issues = []
    for (const file of sourceFiles(context)) {
      const source = relative(context, file)
      if (!source.startsWith('packages/rpc/'))
        continue
      for (const reference of importsOf(file)) {
        const target = targetPath(context, file, reference.specifier)
        const isAppTypeOnly = reference.isTypeOnly
          && reference.importedNames.length === 1
          && reference.importedNames[0] === 'AppType'
        if (target?.startsWith('apps/api/') && !isAppTypeOnly)
          issues.push(issue('FFG06', file, reference.line, 'packages/rpc 只能以 import type 引用 apps/api 的 AppType'))
      }
    }
    return issues
  },
}
