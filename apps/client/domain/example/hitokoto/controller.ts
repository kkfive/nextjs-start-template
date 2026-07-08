import type { Hitokoto } from './type'
import type { HttpService } from '@/lib/request'
import type { RequestOptions } from '@/lib/request/type'
import { service } from './service'

export async function getData(
  client: HttpService,
  options?: RequestOptions,
): Promise<Hitokoto> {
  return service.getData(client, options)
}
