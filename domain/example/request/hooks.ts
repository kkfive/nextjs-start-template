import { useMutation } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { unifiedScenario } from './controller'

type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'

export function useScenarioMutation() {
  return useMutation({
    mutationFn: (scenario: ScenarioType) =>
      unifiedScenario(httpClient, scenario),
  })
}
