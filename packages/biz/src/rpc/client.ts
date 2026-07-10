import type { AppType } from 'api'
import { createClient } from '@kkfive/http-client'
import { hc } from 'hono/client'

/**
 * 创建 hc 类型化 RPC 客户端。
 *
 * fetch 注入 @kkfive/request（responseReturn:'raw' 返回裸 Response 给 hc），
 * 复用 retry + 请求日志 interceptor；envelope 解包由 biz 的 unwrapData 负责。
 * hc 只做类型化 RPC 入口，不重写 interceptor（决策 1）。
 */
export function createBizClient(baseUrl: string) {
  const request = createClient({
    responseParser: { responseReturn: 'raw' },
    retry: 1,
    timeout: 30000,
    hooks: {
      afterResponse: [
        async ({ request: req, options, response }) => {
          // eslint-disable-next-line no-console
          console.log(
            `[RPC] ${options.method || 'GET'} ${req.url} - ${response.status} ${response.statusText}`,
          )
          return response
        },
      ],
    },
  })

  return hc<AppType>(baseUrl, {
    // hc 已拼好完整 URL 与序列化好的 RequestInit；交给 ky 实例消费并复用其 retry / hooks。
    fetch: ((input: RequestInfo | URL, init?: RequestInit) =>
      request.request(input.toString(), init as never) as Promise<Response>) as typeof fetch,
  })
}

export type BizClient = ReturnType<typeof createBizClient>
