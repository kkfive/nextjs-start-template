import type { AppType } from 'api'
import { hc } from 'hono/client'

export function createBizClient(baseUrl: string) {
  return hc<AppType>(baseUrl)
}

export type BizClient = ReturnType<typeof createBizClient>
