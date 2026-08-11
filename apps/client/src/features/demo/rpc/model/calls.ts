import type { ScenarioType } from '@kkfive/contracts'
import { unwrapData } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'

export async function callScenario(scenario: ScenarioType) {
  const response = await rpcClient.example.request.scenario.$post({ json: { scenario } })
  const envelope = await response.json()
  // @hono/zod-validator 0.9 的 .json() 类型混入 ZodSafeParseError 分支；
  // 运行时服务端返回的是 HttpResponse envelope，该分支仅存在于类型层面
  if ('error' in envelope) {
    throw new Error('scenario 响应不处于 zod 解析错误分支')
  }
  return unwrapData(envelope)
}

export async function callEnvelopeScenario(scenario: ScenarioType) {
  const response = await rpcClient.example.request.scenario.$post({ json: { scenario } })
  return response.json()
}

export async function fetchHitokoto() {
  const response = await rpcClient.hitokoto.$get()
  return unwrapData(await response.json())
}
