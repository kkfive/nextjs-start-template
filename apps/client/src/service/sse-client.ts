import type { SSEConfig, SSEEvent } from '@kkfive/http-client'
import { HttpService } from '@kkfive/http-client'
import 'client-only'

export type RequestSseConfig = SSEConfig
export type RequestSseEvent<T = unknown> = SSEEvent<T>

const sseHttp = new HttpService({
  // SSE 示例由当前 Next Route Handler 提供，不复用外部 RPC origin。
  prefix: globalThis.location?.origin ?? 'http://localhost:5373',
})

function createRequestSseStreamImpl<T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestSseConfig,
) {
  return sseHttp.instance.sse<T>(url, data, config)
}

export const createRequestSseStream = createRequestSseStreamImpl
