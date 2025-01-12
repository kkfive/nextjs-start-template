import type { HttpResponseError, RequestOptions } from '@base/utils/request/type'

interface BusinessErrorOptions<T> {
  code: number
  options?: RequestOptions
  response: HttpResponseError<T>
}
export class BusinessError<T> extends Error {
  public readonly name = 'BusinessError'
  public readonly code: number
  public readonly response: HttpResponseError<T>
  public readonly options?: RequestOptions | undefined
  constructor(message: string, _options?: BusinessErrorOptions<T>) {
    super(message)
    this.code = _options?.code as number
    this.response = _options?.response as HttpResponseError<T>
    this.options = _options?.options as RequestOptions
  }

  get message() {
    return super.message
  }
}
