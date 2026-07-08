import type { SSEConfig, SSEEvent } from '@kkfive/http-client'
import { HttpService } from '@kkfive/http-client'
import { env } from '@/config/env'

export type RequestSseConfig = SSEConfig
export type RequestSseEvent<T = unknown> = SSEEvent<T>

function getBaseUrl() {
  if (env.NEXT_PUBLIC_API_URL) {
    return env.NEXT_PUBLIC_API_URL
  }

  return '/'
}

const sseHttp = new HttpService({
  prefix: getBaseUrl(),
})

export function createRequestSseStream<T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestSseConfig,
) {
  return sseHttp.instance.sse<T>(url, data, config)
}
