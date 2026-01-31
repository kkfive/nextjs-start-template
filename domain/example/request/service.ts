import type { HttpService } from '@/lib/request'
import type { HttpResponseError, HttpResponseSuccess, RequestOptions } from '@/lib/request/type'
import api from './const/api'

type GetDataResponse = ExampleRequest.SuccessAPI['Response']
type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'
type ErrorResponse = HttpResponseError<null>

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

function success(
  client: HttpService,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  const { url } = api.success
  const method = config?.method || 'GET'
  return client.request<HttpResponseSuccess<GetDataResponse>>(
    url,
    { ...config, method },
  )
}

function http404(
  client: HttpService,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  const { url } = api.http404
  const method = config?.method || 'GET'
  return client.request<ErrorResponse>(url, { ...config, method })
}

function http500(
  client: HttpService,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  const { url } = api.http500
  const method = config?.method || 'GET'
  return client.request<ErrorResponse>(url, { ...config, method })
}

function http503(
  client: HttpService,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  const { url } = api.http503
  const method = config?.method || 'GET'
  return client.request<ErrorResponse>(url, { ...config, method })
}

export const service = {
  unifiedScenario,
  success,
  http404,
  http500,
  http503,
}
