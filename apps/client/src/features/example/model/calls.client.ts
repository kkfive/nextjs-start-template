import type { ExamplePing } from '@kkfive/contracts'

import { unwrapData } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'

// feature 的 model 层（client 侧）：浏览器交互取数走 client-only RPC 实例。
export async function fetchExamplePing(): Promise<ExamplePing> {
  const res = await rpcClient.example.ping.$get()
  if (!res.ok) {
    throw new Error(`example ping failed: ${res.status}`)
  }
  return unwrapData(await res.json())
}
