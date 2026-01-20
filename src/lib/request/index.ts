import type { RequestInput, RequestInstance, RequestOptions } from './type'
import { Request } from '@kkfive/request'
import defu from 'defu'

export class HttpService {
  instance: RequestInstance
  constructor(defaultOptions: RequestOptions = {}) {
    const options: RequestOptions = {
      retry: 0,
      responseParser: { responseReturn: 'raw' },
    }
    this.instance = Request.create(
      defu(options, defaultOptions),
    )
  }

  request<T = unknown>(input: RequestInput, options?: RequestOptions) {
    return this.instance.request<T>(input, options)
  }

  get<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.instance.get<T>(url, options)
  }

  post<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.instance.post<T>(url, options?.json, options)
  }

  put<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.instance.put<T>(url, options?.json, options)
  }

  delete<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.instance.delete<T>(url, options?.json, options)
  }

  patch<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.instance.patch<T>(url, options?.json, options)
  }
}
