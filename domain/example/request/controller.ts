import type { HttpService } from '@/lib/request'
import type { RequestOptions } from '@/lib/request/type'
import { service } from './service'

type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'

export async function unifiedScenario(
  client: HttpService,
  scenario: ScenarioType,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  return service.unifiedScenario(client, scenario, config)
}

export async function rawScenario(
  client: HttpService,
  scenario: ScenarioType,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  return service.rawScenario(client, scenario, config)
}
