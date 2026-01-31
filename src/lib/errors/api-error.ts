import type { AppErrorOptions } from './app-error'
import { AppError } from './app-error'

export interface ApiErrorOptions extends AppErrorOptions {
  status: number
  statusText?: string
  url?: string
}

export class ApiError extends AppError {
  public readonly status: number
  public readonly statusText?: string
  public readonly url?: string

  constructor(message: string, options: ApiErrorOptions) {
    super(message, options)
    Object.defineProperty(this, 'name', { value: 'ApiError', writable: false })
    this.status = options.status
    this.statusText = options.statusText
    this.url = options.url
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      status: this.status,
      statusText: this.statusText,
      url: this.url,
    }
  }

  static isClientError(status: number): boolean {
    return status >= 400 && status < 500
  }

  static isServerError(status: number): boolean {
    return status >= 500 && status < 600
  }
}
