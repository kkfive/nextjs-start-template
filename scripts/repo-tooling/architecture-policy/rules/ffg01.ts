import type { ArchitecturePolicy } from '../types.ts'
import { issue, relative } from './helpers.ts'

const legacyPath = /\/src\/(?:components\/(?:home|demo)(?:\/|$)|components\/.*\/domain(?:\/|$)|config\/(?:demo-nav|site-features)\.tsx?$|service\/(?:hitokoto|demo)(?:\/|$)|store\/mouse-store(?:\.test)?\.ts$)/

export const ffg01: ArchitecturePolicy = {
  id: 'FFG01',
  message: '业务模块必须位于 src/features，删除清单中的旧业务目录不可出现',
  check(context) {
    return context.files.flatMap((file) => {
      const normalized = `/${relative(context, file)}`
      return legacyPath.test(normalized)
        ? [issue('FFG01', file, 1, '旧业务目录已删除，业务模块必须迁入 src/features/<feature>')]
        : []
    })
  },
}
