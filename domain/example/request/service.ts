import type { HttpService } from '@/lib/request'
import type { HttpResponseSuccess, RequestOptions } from '@/lib/request/type'
import api from './const/api'

type GetDataResponse = ExampleRequest.SuccessAPI['Response']
type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401'

function unifiedScenario(
  client: HttpService,
  scenario: ScenarioType,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  const { url } = api.unifiedScenario
  const method = config?.method || 'POST'
  return client.request<HttpResponseSuccess<GetDataResponse>>(
    url,
    { ...config, method, json: { scenario } },
  )
}

export const service = {
  unifiedScenario,
}
