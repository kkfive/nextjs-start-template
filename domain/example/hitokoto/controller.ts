import type { HttpService } from '@base/utils/request'
import type { RequestOptions } from '@base/utils/request/type'
import { service } from './service'

export class Controller {
  static async getData(client: HttpService, options?: RequestOptions) {
    const result = await service.getData(client, options)
    const jsonData = await result.json()
    return jsonData
  }
}
