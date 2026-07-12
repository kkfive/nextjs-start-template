import type { ArchitecturePolicy } from '../types.ts'
import { issue, relative } from './helpers.ts'

const runtimeFile = /^(?:http|rpc|sse)-[\w-]+\.(?:ts|tsx)$|^index\.sse\.(?:ts|tsx)$/

export const ffg03: ArchitecturePolicy = {
  id: 'FFG03',
  message: 'src/service 仅允许 HTTP/RPC/SSE 运行时实例与边界标记',
  check(context) {
    return context.files.flatMap((file) => {
      const match = relative(context, file).match(/^apps\/[^/]+\/src\/service\/(.+)$/)
      if (!match || runtimeFile.test(match[1]) || /\.test\.(?:ts|tsx)$/.test(match[1]))
        return []
      return [issue('FFG03', file, 1, 'src/service 仅允许 http-、rpc-、sse- 运行时实例文件，不得存放业务代码')]
    })
  },
}
