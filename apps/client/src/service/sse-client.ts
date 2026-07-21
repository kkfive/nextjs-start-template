import type { SSEConfig, SSEEvent } from '@kkfive/http-client'
import { HttpService } from '@kkfive/http-client'
import { env } from '@/config/env'
import 'client-only'

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

function createRequestSseStreamImpl<T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestSseConfig,
) {
  return sseHttp.instance.sse<T>(url, data, config)
}

export const createRequestSseStream = createRequestSseStreamImpl
