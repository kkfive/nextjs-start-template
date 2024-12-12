import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface RequestConfigMeta {
  /**
   * 仅响应数据
   * @default true
   */
  isOnlyData?: boolean

  /**
   * 是否处理响应数据
   */
  isTransformResponse?: boolean

  dataField?: string
}
export interface RequestConfig<D = unknown, P = Record<string, string>> extends AxiosRequestConfig<D> {
  fetchOptions?: RequestInit
  meta?: RequestConfigMeta
  params?: P
}

enum ERROR_SHOW_TYPE {
  // 不提示
  SILENT = 0,
  // 警告消息
  WARN_MESSAGE = 1,
  // 错误消息
  ERROR_MESSAGE = 2,
  // 通知消息
  NOTIFICATION = 3,
  // 页面消息
  REDIRECT = 9,
}

export interface HttpResponseError<T = null> {
  code: number
  data: T
  errorShowType: ERROR_SHOW_TYPE
  message: string
  requestId: string
  success: false
  timestamp: string
}
export interface HttpResponseSuccess<T = unknown> {
  data: T
  code?: number
  message?: string
  success: true
}

export interface InternalRequestConfig<D = any> extends InternalAxiosRequestConfig<D> {
  // config?: RequestConfig<D>
  meta?: RequestConfigMeta
}
export interface RequestResponse<T = any, D = any> extends AxiosResponse<T, D> {
  // config: RequestConfig<D>
  // headers: AxiosRequestHeaders
  config: InternalRequestConfig<D>
}
export interface RequestInterceptorConfig {
  fulfilled?: (
    config: InternalRequestConfig,
  ) =>
    | InternalRequestConfig<any>
    | Promise<InternalRequestConfig<any>>
  rejected?: (error: any) => any
}

export interface ResponseInterceptorConfig<T = any> {
  fulfilled?: (
    response: RequestResponse<T>,
  ) => RequestResponse | Promise<RequestResponse>
  rejected?: (error: any) => any
}
