import type { RequestOptions } from './type'

export type BusinessErrorOptions = {
  code?: number
  options?: RequestOptions
  response?: unknown
}

/**
 * BusinessError —— 业务错误类（有 throw/instanceof 行为）。
 * 不放 @kkfive/contracts（契约只放数据形状 ErrorResponseSchema）。
 */
export class BusinessError extends Error {
  public readonly name = 'BusinessError'
  public readonly code?: number
  public readonly response?: unknown
  public readonly options?: RequestOptions

  constructor(message: string, _options?: BusinessErrorOptions) {
    super(message)
    this.code = _options?.code
    this.response = _options?.response
    this.options = _options?.options
  }
}
