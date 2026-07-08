import type { RequestOptions } from './type'
import { BusinessError } from './error'

export type ErrorContext = {
  url: string
  method: string
  status: number
  statusText: string
}

/**
 * 把 HTTP 错误响应转换为 BusinessError 并抛出。
 * 各 app 的拦截器在响应错误时调用。
 */
export function createErrorResponse(
  context: ErrorContext,
  rawData: unknown,
  options?: RequestOptions,
): never {
  const { status, statusText } = context

  const errorOptions = {
    code: status,
    response: rawData,
    options,
  }

  if (status >= 500) {
    throw new BusinessError('服务暂时不可用，请稍后重试', errorOptions)
  }
  if (status === 401) {
    throw new BusinessError('登录已过期，请重新登录', errorOptions)
  }
  if (status === 403) {
    throw new BusinessError('没有权限访问该资源', errorOptions)
  }
  if (status === 404) {
    throw new BusinessError('请求的资源不存在', errorOptions)
  }

  throw new BusinessError(`请求失败: ${statusText}`, errorOptions)
}
