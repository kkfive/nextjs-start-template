import type { ArchitecturePolicy } from '../types.ts'
import { isAllowedAppTypeImport } from './app-type-consumer.ts'
import { importsOf, issue, relative, sourceFiles, targetPath } from './helpers.ts'

export const ffg06: ArchitecturePolicy = {
  id: 'FFG06',
  message: 'api AppType 仅允许由 app service 的 rpc-*.ts 通过 import type 消费',
  check(context) {
    const issues = []
    for (const file of sourceFiles(context)) {
      const source = relative(context, file)
      if (source.startsWith('apps/api/'))
        continue
      for (const reference of importsOf(file)) {
        const target = targetPath(context, file, reference.specifier)
        const targetsApi = reference.specifier === 'api' || target?.startsWith('apps/api')
        if (targetsApi && !isAllowedAppTypeImport(source, reference))
          issues.push(issue('FFG06', file, reference.line, '只有 app service 的 rpc-*.ts 可通过 import type 导入 api 的 AppType'))
      }
    }
    return issues
  },
}
