import type { ScenarioType } from '@kkfive/contracts'
import { useMutation } from '@tanstack/react-query'
import type { BizClient } from '../rpc/client'
import { callScenario } from './calls'

export function useScenarioMutation(client: BizClient) {
  return useMutation({
    mutationKey: ['scenario'],
    mutationFn: (scenario: ScenarioType) => callScenario(client, scenario),
  })
}
