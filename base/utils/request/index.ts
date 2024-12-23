import type { AxiosError, AxiosInstance } from 'axios'
import type { RequestConfig, RequestConfigMeta, RequestInterceptorConfig, RequestResponse, ResponseInterceptorConfig } from './type'
import axios from 'axios'
import defu from 'defu'
import { RequestError } from './error'

export class HttpService {
  private readonly axiosInstance: AxiosInstance

  // 是否正在刷新token
  public isRefreshing = false
  // 刷新token队列
  public refreshTokenQueue: ((token: string) => void)[] = []

  constructor(options: RequestConfig = {}) {
    const defaultOptions: RequestConfig = {
      adapter: 'fetch',
      meta: this.defaultMeta,
    }
    const config = defu(options, defaultOptions)
    this.axiosInstance = axios.create(config)
  }

  private get defaultMeta(): Required<RequestConfigMeta> {
    return {
      isOnlyData: true,
      isTransformResponse: true,
      dataField: 'data',
    }
  }

  addResponseInterceptors({ fulfilled, rejected }: ResponseInterceptorConfig) {
    return this.axiosInstance.interceptors.response.use(fulfilled, rejected)
  }

  addRequestInterceptors({ fulfilled, rejected }: RequestInterceptorConfig) {
    return this.axiosInstance.interceptors.request.use(fulfilled, rejected)
  }

  async request<T = unknown, D = any, R = RequestResponse<T, D>, P = Record<string, any>>(config: RequestConfig<D, P>): Promise<R> {
    try {
      const res = await this.axiosInstance.request<T, R, D>(config)
      return res as R
    }
    catch (err) {
      if ((err as AxiosError).isAxiosError) {
        throw new RequestError((err as AxiosError).message, {
          config,
          status: (err as AxiosError).response?.status,
          statusText: (err as AxiosError).response?.statusText,
          response: (err as AxiosError).response?.data as any,
        })
      }

      throw err
    }
  }

  async get<T = unknown, P = Record<string, any>, R = RequestResponse<T, null> >(url: string, config?: RequestConfig<null, P>): Promise<R> {
    return await this.request<T, null, R, P>({ ...config, url, method: 'GET' })
  }

  async post<T = unknown, D = any, R = RequestResponse<T, D>, P = Record<string, any>>(url: string, data?: D, config?: RequestConfig<D, P>): Promise<R> {
    return await this.request<T, D, R, P>({ ...config, url, method: 'POST', data })
  }

  async put<T = unknown, D = any, R = RequestResponse<T, D>, P = Record<string, any>>(url: string, data?: D, config?: RequestConfig<D, P>): Promise<R> {
    return await this.request<T, D, R, P>({ ...config, url, method: 'PUT', data })
  }

  async delete<T = unknown, P = Record<string, any>, R = RequestResponse<T, null>>(url: string, config?: RequestConfig<null, P>): Promise<R> {
    return await this.request<T, null, R, P>({ ...config, url, method: 'DELETE' })
  }

  async patch<T = unknown, D = any, R = RequestResponse<T, D>, P = Record<string, any>>(url: string, data?: D, config?: RequestConfig<D, P>): Promise<R> {
    return await this.request<T, D, R, P>({ ...config, url, method: 'PATCH', data })
  }

  async head<T = unknown, P = Record<string, any>, R = RequestResponse<T, null>>(url: string, config?: RequestConfig<null, P>): Promise<R> {
    return await this.request<T, null, R, P>({ ...config, url, method: 'HEAD' })
  }
}
