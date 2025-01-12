import type { Input, KyInstance, Options } from 'ky'

export type RequestInput = Input

export interface RequestOptions extends Options {}

export type RequestInstance = KyInstance

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
