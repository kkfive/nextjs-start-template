import type { HttpResponseError, RequestConfig, RequestResponse } from './type'

export class RequestError<T = null, D = unknown, P = any> extends Error {
  public readonly name = 'RequestError'
  // HTTP 状态码
  public readonly status?: number
  // HTTP 状态码描述
  public readonly statusText?: string

  private _config?: RequestConfig<D, P>

  private _response?: RequestResponse<HttpResponseError<T>, D>

  constructor(message: string, options?: {
    /** HTTP 状态码 */
    status?: number
    statusText?: string
    config?: RequestConfig<D, P>
    response?: RequestResponse<HttpResponseError<T>, D>
  }) {
    super(message)
    this.status = options?.status
    this.statusText = options?.statusText
    this._config = options?.config
    this._response = options?.response
  }

  get config() {
    return this._config
  }

  get response() {
    return this._response
  }

  get code() {
    return this.response?.data.code
  }

  get data() {
    return this.response?.data
  }
}
