import type { RequestInput, RequestInstance, RequestOptions } from './type'
import defu from 'defu'
import ky from 'ky'

export class HttpService {
  instance: RequestInstance
  constructor(defaultOptions: RequestOptions = {}) {
    const options: RequestOptions = { retry: 0 }
    this.instance = ky.create(
      defu(options, defaultOptions),
    )
  }

  request<T = unknown>(input: RequestInput, options?: RequestOptions) {
    return this.instance<T>(input, options)
  }

  get<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'get' })
  }

  post<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'post' })
  }

  put<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'put' })
  }

  delete<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'delete' })
  }

  patch<T = unknown>(url: RequestInput, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'patch' })
  }
}
