import type { HttpService } from '@/lib/request'

import type { RequestOptions } from '@/lib/request/type'
import { service } from './service'

export class Controller {
  static async getData(client: HttpService, options?: RequestOptions) {
    const result = await service.getData(client, options)
    const jsonData = await result.json()
    return jsonData
  }
}
