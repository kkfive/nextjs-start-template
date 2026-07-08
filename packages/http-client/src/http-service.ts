import type { RequestInput, RequestInstance, RequestOptions } from './type'
import { createClient } from '@kkfive/request'
import defu from 'defu'

/**
 * HttpService —— 框架无关、运行环境无关的 HTTP 抽象。
 *
 * 各 app 创建自己的实例（浏览器 fetch / 服务端 fetch / SSE），
 * 通过参数注入到 @kkfive/domain-core 的 Service/Controller。
 */
export class HttpService {
  instance: RequestInstance
  constructor(options: RequestOptions = {}) {
    const baseOptions: RequestOptions = {
      retry: 1,
      timeout: 30000,
      responseParser: { responseReturn: 'body' },
    }
    this.instance = createClient(defu(options, baseOptions))
  }

  request<T = unknown>(input: RequestInput, options?: RequestOptions): Promise<T> {
    return this.instance.request<T>(input, options ?? {})
  }

  get<T = unknown>(url: RequestInput, options?: RequestOptions): Promise<T> {
    return this.instance.get<T>(url, options)
  }

  post<T = unknown>(url: RequestInput, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.instance.post<T>(url, body, options)
  }

  put<T = unknown>(url: RequestInput, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.instance.put<T>(url, body, options)
  }

  delete<T = unknown>(url: RequestInput, options?: RequestOptions): Promise<T> {
    return this.instance.delete<T>(url, options)
  }

  patch<T = unknown>(url: RequestInput, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.instance.patch<T>(url, body, options)
  }
}
