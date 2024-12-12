import type { HttpService } from '@base/utils/request'
import type { RequestConfig } from '@base/utils/request/type'
import api from './const/api'

type GetDataResponse = ExampleRequest.SuccessAPI['Response']
type GetDataParams = ExampleRequest.SuccessAPI['Params']
async function getSuccess(client: HttpService, config?: RequestConfig<unknown, GetDataParams>): Promise<GetDataResponse> {
  const { url, method } = api.successApi
  return await client.request<GetDataResponse, unknown, GetDataParams, GetDataResponse>({ ...config, url, method })
}

async function getErrorBusiness(client: HttpService, config?: RequestConfig<unknown, GetDataParams>): Promise<GetDataResponse> {
  const { url, method } = api.errorBusinessApi
  return await client.request<GetDataResponse, unknown, GetDataParams, GetDataResponse>({ ...config, url, method })
}

async function getError400(client: HttpService, config?: RequestConfig<unknown, GetDataParams>): Promise<GetDataResponse> {
  const { url, method } = api.error400Api
  return await client.request<GetDataResponse, unknown, GetDataParams, GetDataResponse>({ ...config, url, method })
}

async function getError401(client: HttpService, config?: RequestConfig<unknown, GetDataParams>): Promise<GetDataResponse> {
  const { url, method } = api.error401Api
  return await client.request<GetDataResponse, unknown, GetDataParams, GetDataResponse>({ ...config, url, method })
}

export const service = {
  getSuccess,
  getErrorBusiness,
  getError400,
  getError401,
}
