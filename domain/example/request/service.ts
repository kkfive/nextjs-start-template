import type { HttpResponseSuccess, RequestOptions } from '@/lib/request/type'
import type { HttpService } from '../../../base/utils/request'
import api from './const/api'

type GetDataResponse = ExampleRequest.SuccessAPI['Response']
function getSuccess(client: HttpService, config?: RequestOptions) {
  const { url, method } = api.successApi
  return client.request<HttpResponseSuccess<GetDataResponse>>(url, { ...config, method })
}

function getErrorBusiness(client: HttpService, config?: RequestOptions) {
  const { url, method } = api.errorBusinessApi
  return client.request<HttpResponseSuccess<GetDataResponse>>(url, { ...config, method })
}

function getError400(client: HttpService, config?: RequestOptions) {
  const { url, method } = api.error400Api
  return client.request<HttpResponseSuccess<GetDataResponse>>(url, { ...config, method })
}

function getError401(client: HttpService, config?: RequestOptions) {
  const { url, method } = api.error401Api
  return client.request<HttpResponseSuccess<GetDataResponse>>(url, { ...config, method })
}

export const service = {
  getSuccess,
  getErrorBusiness,
  getError400,
  getError401,
}
