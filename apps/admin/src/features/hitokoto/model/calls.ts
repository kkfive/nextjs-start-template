import { unwrapData } from '@kkfive/rpc'
import { rpcServer } from '@/service/rpc-server'

export async function fetchHitokoto() {
  const response = await rpcServer.hitokoto.$get()
  return unwrapData(await response.json())
}
