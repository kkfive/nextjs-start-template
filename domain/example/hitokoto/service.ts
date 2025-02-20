import type { HttpService } from '@/lib/request'
import type { RequestOptions } from '@/lib/request/type'
import api from './const/api'

type GetDataResponse = Hitokoto.GetDataAPI['Response']

async function getData(client: HttpService, options?: RequestOptions) {
  const { url, method } = api.getData
  return client.request<GetDataResponse>(url, { ...options, method })
}

export const service = { getData }
