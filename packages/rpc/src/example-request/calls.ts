import type { ScenarioType } from '@kkfive/contracts'
import type { RpcClient } from '../rpc/client'
import { unwrapData } from '../rpc/envelope'

/**
 * unified：解包 envelope，业务失败（success:false）抛 BusinessError。
 * 供 demo / card / hook 复用，保证错误归一化逻辑单点。
 */
export async function callScenario(client: RpcClient, scenario: ScenarioType) {
  const res = await client.example.request.scenario.$post({ json: { scenario } })
  return unwrapData(await res.json())
}

/**
 * envelope：返回原始响应包络（成功 / 失败均返回），用于演示响应结构。
 * 不经 unwrapData，让消费方观察完整 envelope。
 */
export async function callEnvelopeScenario(client: RpcClient, scenario: ScenarioType) {
  const res = await client.example.request.scenario.$post({ json: { scenario } })
  return res.json()
}
