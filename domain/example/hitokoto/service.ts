import type { HttpService } from '@base/utils/request'
import type { RequestConfig } from '@base/utils/request/type'
import api from './const/api'

type GetDataResponse = Hitokoto.GetDataAPI['Response']
type GetDataParams = Hitokoto.GetDataAPI['Params']
async function getData(client: HttpService, config?: RequestConfig<unknown, GetDataParams>): Promise<GetDataResponse> {
  const { url, method } = api.getData
  return await client.request<GetDataResponse, unknown, GetDataParams, GetDataResponse>({ ...config, url, method })
}

export { getData }
