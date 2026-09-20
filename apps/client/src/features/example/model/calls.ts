import type { ExamplePing } from '@kkfive/contracts'

import { unwrapData } from '@kkfive/rpc'
import { rpcServer } from '@/service/rpc-server'

// feature 的 model 层（server 侧）：SSR 首屏取数走 server-only RPC 实例。
export async function fetchExamplePing(): Promise<ExamplePing> {
  const res = await rpcServer.example.ping.$get()
  if (!res.ok) {
    throw new Error(`example ping failed: ${res.status}`)
  }
  return unwrapData(await res.json())
}
