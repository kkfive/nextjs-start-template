import type { ArchitecturePolicy } from '../types.ts'
import { importsOf, issue, sourceFiles } from './helpers.ts'

const legacySpecifier = /^@domain(?:\/|$)|^@kkfive\/domain-core(?:\/|$)/

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
    }
    return issues
  },
}
