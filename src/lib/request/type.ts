import type { Request, RequestOption } from '@kkfive/request'

export type RequestInput = string

export interface RequestOptions extends RequestOption {}

export type RequestInstance = Request

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
