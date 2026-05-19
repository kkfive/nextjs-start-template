import type { SuccessAPI } from './type'
import type { HttpService } from '@/lib/request'
import type { RequestOptions } from '@/lib/request/type'
import { BusinessError } from '@/lib/request/error'
import { unifiedScenario as unifiedScenarioApi } from './const/api'
import { isErrorEnvelope, isRequestError, isSuccessEnvelope, throwBusinessErrorFromRaw } from './utils'

type GetDataResponse = SuccessAPI['Response']
type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'

type ApiEnvelope<T> = { success: true, data: T } | { success: false, code: number, message: string, data: null, errorShowType: number, requestId: string, timestamp: string }

async function unifiedScenario(
  client: HttpService,
  scenario: ScenarioType,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
): Promise<GetDataResponse> {
  try {
    const envelope = await client.request<ApiEnvelope<GetDataResponse>>(
      unifiedScenarioApi.url,
      { ...config, method: config?.method || 'POST', json: { scenario } },
    )
    if (!envelope.success) {
      throw new BusinessError(envelope.message, {
        code: envelope.code,
        response: envelope,
        options: config,
      })
    }
    return envelope.data
  }
  catch (error) {
    if (isRequestError(error) && error.raw) {
      throwBusinessErrorFromRaw(error.raw, error.code ?? 0, config)
    }
    throw error
  }
}

async function rawScenario(
  client: HttpService,
  scenario: ScenarioType,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
): Promise<ApiEnvelope<GetDataResponse>> {
  try {
    return await client.request<ApiEnvelope<GetDataResponse>>(
      unifiedScenarioApi.url,
      { ...config, method: config?.method || 'POST', json: { scenario } },
    )
  }
  catch (error) {
    if (isRequestError(error) && error.raw && isSuccessEnvelope<GetDataResponse>(error.raw)) {
      return error.raw
    }
    if (isRequestError(error) && error.raw && isErrorEnvelope(error.raw)) {
      return error.raw
    }
    throw error
  }
}

// ===== 基础请求方法演示 =====

const methodsApi = {
  url: '/api/example/request/methods',
}

async function getExample(client: HttpService, params?: Record<string, string>, config?: RequestOptions) {
  return client.get<{
    success: true
    data: { method: string, message: string, query: Record<string, string>, headers: Record<string, string> }
  }>(methodsApi.url, { ...config, params })
}

async function postExample(client: HttpService, body?: unknown, config?: RequestOptions) {
  return client.post<{
    success: true
    data: { method: string, message: string, receivedBody: unknown, headers: Record<string, string> }
  }>(methodsApi.url, body, config)
}

async function putExample(client: HttpService, body?: unknown, config?: RequestOptions) {
  return client.put<{
    success: true
    data: { method: string, message: string, receivedBody: unknown, headers: Record<string, string> }
  }>(methodsApi.url, body, config)
}

async function deleteExample(client: HttpService, id?: string, config?: RequestOptions) {
  return client.delete<{
    success: true
    data: { method: string, message: string, id: string, headers: Record<string, string> }
  }>(methodsApi.url, { ...config, params: id ? { id } : undefined })
}

async function patchExample(client: HttpService, body?: unknown, config?: RequestOptions) {
  return client.patch<{
    success: true
    data: { method: string, message: string, receivedBody: unknown, headers: Record<string, string> }
  }>(methodsApi.url, body, config)
}

// ===== 配置参数演示 =====

const configApi = {
  url: '/api/example/request/config',
}

async function configExample(
  client: HttpService,
  delay?: number,
  failRate?: number,
  config?: RequestOptions,
) {
  const params: Record<string, string> = {}
  if (delay !== undefined)
    params.delay = String(delay)
  if (failRate !== undefined)
    params.failRate = String(failRate)

  return client.get<{
    success: true
    data: { message: string, delay: number, failRate: number, timestamp: string }
  }>(configApi.url, { ...config, params })
}

// ===== 认证演示 =====

const authApi = {
  url: '/api/example/request/auth',
}

async function authExample(
  client: HttpService,
  mode?: 'default' | 'success' | 'skip',
  config?: RequestOptions,
) {
  const params: Record<string, string> = {}
  if (mode)
    params.mode = mode

  return client.get<{
    success: true
    data: { message: string, user?: { id: number, name: string } }
  }>(authApi.url, { ...config, params })
}

export const service = {
  unifiedScenario,
  rawScenario,
  getExample,
  postExample,
  putExample,
  deleteExample,
  patchExample,
  configExample,
  authExample,
}
