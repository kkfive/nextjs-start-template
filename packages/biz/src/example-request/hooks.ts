import type { ScenarioType } from '@kkfive/contracts'
import { useMutation } from '@tanstack/react-query'
import { unwrapData } from '../rpc/envelope'
import type { BizClient } from '../rpc/client'

export function useScenarioMutation(client: BizClient) {
  return useMutation({
    mutationKey: ['scenario'],
    mutationFn: async (scenario: ScenarioType) => {
      const res = await client.example.request.scenario.$post({ json: { scenario } })
      return unwrapData(await res.json())
    },
  })
}
