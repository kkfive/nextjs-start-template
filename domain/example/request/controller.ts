import type { HttpService } from '@/lib/request'
import type { HttpResponseError, HttpResponseSuccess, RequestOptions } from '@/lib/request/type'
import { BusinessError } from '@/lib/request/error'
import { service } from './service'

export class Controller {
  static async getSuccessData(client: HttpService | any, config?: RequestOptions) {
    const result = await service.getSuccess(client, config)
    const data = await result.json()
    return transformData(data, config)
  }

  static async getErrorBusinessData(client: HttpService | any, config?: RequestOptions) {
    const result = await service.getErrorBusiness(client, config)
    const data = await result.json()
    return transformData(data, config)
  }

  static async getError400Data(client: HttpService | any, config?: RequestOptions) {
    const result = await service.getError400(client, config)
    const data = await result.json()
    return transformData(data, config)
  }

  static async getError401Data(client: HttpService | any, config?: RequestOptions) {
    const result = await service.getError401(client, config)
    const data = await result.json()
    return transformData(data, config)
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
