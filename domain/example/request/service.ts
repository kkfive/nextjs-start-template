import type { SuccessAPI } from './type'
import type { HttpService } from '@/lib/request'
import type { RequestOptions } from '@/lib/request/type'
import { BusinessError } from '@/lib/request/error'
import { unifiedScenario as unifiedScenarioApi } from './const/api'
import { isRequestError, isSuccessEnvelope, isErrorEnvelope, throwBusinessErrorFromRaw } from './utils'

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

export const service = {
  unifiedScenario,
  rawScenario,
}
