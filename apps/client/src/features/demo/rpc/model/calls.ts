import type { ScenarioType } from '@kkfive/contracts'
import { unwrapData } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'

export async function callScenario(scenario: ScenarioType) {
  const response = await rpcClient.example.request.scenario.$post({ json: { scenario } })
  return unwrapData(await response.json())
}

export async function callEnvelopeScenario(scenario: ScenarioType) {
  const response = await rpcClient.example.request.scenario.$post({ json: { scenario } })
  return response.json()
}

export async function fetchHitokoto() {
  const response = await rpcClient.hitokoto.$get()
  return unwrapData(await response.json())
}
