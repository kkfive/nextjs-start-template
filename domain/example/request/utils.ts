import type { RequestOptions } from '@/lib/request/type'
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

// @kkfive/request 在 HTTP 错误时抛出的错误结构
type RequestErrorShape = {
  name: 'RequestError'
  raw?: Record<string, unknown>
  code?: number
  message?: string
}

export function isRequestError(error: unknown): error is Error & RequestErrorShape {
  return error instanceof Error && error.name === 'RequestError'
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
 * 从 RequestError.raw 中提取业务错误并转换为 BusinessError
 */
export function throwBusinessErrorFromRaw(
  raw: Record<string, unknown>,
  fallbackCode: number,
  options?: RequestOptions,
): never {
  if (isErrorEnvelope(raw)) {
    throw new BusinessError(raw.message, {
      code: raw.code,
      response: raw,
      options,
    })
  }
  throw new BusinessError('请求失败', {
    code: fallbackCode,
    options,
  })
}
