import type { GetDataAPI } from './type'
import type { HttpService } from '@/lib/request'
import type { RequestOptions } from '@/lib/request/type'
import { getData as getDataApi } from './const/api'

type GetDataResponse = GetDataAPI['Response']

async function getData(client: HttpService, options?: RequestOptions) {
  const { url, method } = getDataApi
  return client.request<GetDataResponse>(url, { ...options, method })
}

export const service = { getData }
