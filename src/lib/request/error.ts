import type { RequestOptions } from '@/lib/request/type'

interface BusinessErrorOptions {
  code?: number
  options?: RequestOptions
  response?: unknown
}

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
