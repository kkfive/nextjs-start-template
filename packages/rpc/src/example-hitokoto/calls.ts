import type { RpcClient } from '../rpc/client'
import { unwrapData } from '../rpc/envelope'

/**
 * 获取一言：解包 envelope，失败抛 BusinessError。
 * 供 SSR / hook / card 复用。
 */
export async function fetchHitokoto(client: RpcClient) {
  const res = await client.hitokoto.$get()
  return unwrapData(await res.json())
}
