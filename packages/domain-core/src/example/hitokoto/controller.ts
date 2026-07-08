import type { Hitokoto } from './type'
import type { HttpService, RequestOptions } from '@kkfive/http-client'
import { service } from './service'

export async function getData(
  client: HttpService,
  options?: RequestOptions,
): Promise<Hitokoto> {
  return service.getData(client, options)
}
