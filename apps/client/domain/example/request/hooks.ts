import type { HttpService } from '@kkfive/http-client'
import { Controller } from '@kkfive/domain-core/example/request'
import { useMutation } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'

type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'

export function useScenarioMutation(http?: HttpService) {
  const client = http ?? httpClient
  return useMutation({
    mutationFn: (scenario: ScenarioType) =>
      Controller.unifiedScenario(client, scenario),
  })
}
