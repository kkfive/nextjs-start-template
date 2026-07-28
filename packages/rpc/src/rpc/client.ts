import type { HttpService } from '@kkfive/http-client'
import type { Env, Hono, Schema } from 'hono'
import { hc } from 'hono/client'

type RpcApp = Hono<Env, Schema, string>

/**
 * 创建 hc 类型化 RPC 客户端。
 *
 * fetch 走 app 注入的 HttpService 实例（http.instance），复用实例的 retry / hooks /
 * 401 跳转 / 错误归一化等拦截器；responseReturn:'raw' 让 hc 拿到裸 Response
 *（HttpService 默认 'body'）。envelope 解包由 rpc 的 unwrapData 负责。
 */
export function createRpcClient<App extends RpcApp>(
  http: HttpService,
  baseUrl: string,
): ReturnType<typeof hc<App>> {
  return hc<App>(baseUrl, {
    fetch: ((input: RequestInfo | URL, init?: RequestInit) => {
      const target = new URL(input.toString())
      return http.instance.request(`${target.pathname}${target.search}`, {
        ...(init as object),
        // 显式覆盖注入 HttpService 的 Next-origin prefix，RPC 始终使用 hc 的外部 origin。
        prefix: target.origin,
        responseParser: { responseReturn: 'raw' },
      } as never) as Promise<Response>
    }) as typeof fetch,
  })
}
