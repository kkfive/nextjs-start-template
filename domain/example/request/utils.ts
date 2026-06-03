import type { RequestOptions } from '@/lib/request/type'
import { isHTTPError } from '@kkfive/request'
import { BusinessError } from '@/lib/request/error'

type SuccessEnvelope<T> = {
  success: true
  data: T
}

type ErrorEnvelope = {
  success: false
  code: number
  message: string
  data: null
  errorShowType: number
  requestId: string
  timestamp: string
}

type HttpErrorWithData = Error & {
  data?: unknown
  response: Response
}

export function isRequestHttpError(error: unknown): error is HttpErrorWithData {
  return isHTTPError(error)
}

export function getHttpErrorData(error: HttpErrorWithData) {
  return error.data
}

export function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (typeof value !== 'object' || value === null)
    return false
  const obj = value as Record<string, unknown>
  return obj.success === false && typeof obj.message === 'string' && typeof obj.code === 'number'
}

export function isSuccessEnvelope<T>(value: unknown): value is SuccessEnvelope<T> {
  if (typeof value !== 'object' || value === null)
    return false
  const obj = value as Record<string, unknown>
  return obj.success === true && 'data' in obj
}

/**
 * 从 HTTPError.data 中提取业务错误并转换为 BusinessError
 */
export function throwBusinessErrorFromData(
  data: unknown,
  fallbackCode: number,
  options?: RequestOptions,
): never {
  if (isErrorEnvelope(data)) {
    throw new BusinessError(data.message, {
      code: data.code,
      response: data,
      options,
    })
  }
  throw new BusinessError('请求失败', {
    code: fallbackCode,
    options,
  })
}
