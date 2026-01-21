import type { HttpService } from '@/lib/request'
import type { HttpResponseError, HttpResponseSuccess, RequestOptions } from '@/lib/request/type'
import { BusinessError } from '@/lib/request/error'
import { service } from './service'

type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'

export class Controller {
  static async unifiedScenario(
    client: HttpService | any,
    scenario: ScenarioType,
    config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
  ) {
    try {
      const response = await service.unifiedScenario(client, scenario, config)
      const result = await response.json()
      return transformData(result, config)
    }
    catch (error: any) {
      // Handle RequestError from @kkfive/request for HTTP error status codes
      if (error.name === 'RequestError' && error.raw) {
        return transformData(error.raw, config)
      }
      throw error
    }
  }

  static async rawScenario(
    client: HttpService | any,
    scenario: ScenarioType,
    config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
  ) {
    try {
      const response = await service.unifiedScenario(client, scenario, config)
      return await response.json()
    }
    catch (error: any) {
      if (error.name === 'RequestError' && error.raw) {
        return error.raw
      }
      throw error
    }
  }
}

function transformData<T>(data: HttpResponseSuccess<T> | HttpResponseError<T>, options?: RequestOptions) {
  if (data.success) {
    return data.data
  }
  else {
    throw new BusinessError(data.message, {
      options,
      code: data.code,
      response: data,
    })
  }
}
