/**
 * API 响应错误的数据形状（契约层只放数据形状，不放错误类）。
 * 错误类（如 BusinessError，有 throw/instanceof 行为）属于 @kkfive/http-client。
 */

/** 错误展示方式枚举 */
export enum ErrorShowType {
  /** 不提示 */
  SILENT = 0,
  /** 警告消息 */
  WARN_MESSAGE = 1,
  /** 错误消息 */
  ERROR_MESSAGE = 2,
  /** 通知消息 */
  NOTIFICATION = 3,
  /** 页面跳转 */
  REDIRECT = 9,
}

/** 失败响应的 envelope */
export type HttpResponseError<T = null> = {
  code: number
  data: T
  errorShowType: ErrorShowType
  message: string
  requestId: string
  success: false
  timestamp: string
}

/** 成功响应的 envelope */
export type HttpResponseSuccess<T = unknown> = {
  data: T
  code?: number
  message?: string
  success: true
}

/** 统一响应 envelope（成功或失败） */
export type HttpResponse<T = unknown> = HttpResponseSuccess<T> | HttpResponseError<T>
