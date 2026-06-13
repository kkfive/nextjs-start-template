import type { RequestOptions } from '@/lib/request/type'
import { env } from '@/config/env'
import { HttpService } from '@/lib/request'
import { createErrorResponse } from '@/lib/request/error-handler'

function getBaseUrl() {
  if (env.NEXT_PUBLIC_API_URL) {
    return env.NEXT_PUBLIC_API_URL
  }
  return '/'
}

function getRetryLimit(retry: RequestOptions['retry']) {
  if (typeof retry === 'number') {
    return retry
  }

  return retry?.limit ?? 0
}

function getRetryMethods(retry: RequestOptions['retry']) {
  if (typeof retry === 'number') {
    return ['get', 'put', 'head', 'delete', 'options', 'trace']
  }

  return retry?.methods ?? ['get', 'put', 'head', 'delete', 'options', 'trace']
}

function getRetryStatusCodes(retry: RequestOptions['retry']) {
  if (typeof retry === 'number') {
    return [408, 413, 429, 500, 502, 503, 504]
  }

  return retry?.statusCodes ?? [408, 413, 429, 500, 502, 503, 504]
}

function shouldWaitForRetry(method: string, status: number, retryCount: number, retry: RequestOptions['retry']) {
  const retryableMethods = getRetryMethods(retry)
  const retryableStatusCodes = getRetryStatusCodes(retry)

  return retryableMethods.includes(method.toLowerCase()) && retryableStatusCodes.includes(status) && retryCount < getRetryLimit(retry)
}

const http = new HttpService({
  prefix: getBaseUrl(),
  hooks: {
    afterResponse: [
      // Response logging interceptor - logs request details and timing
      async ({ request, options, response }) => {
        const url = request.url
        const method = options.method || 'GET'
        const status = response.status
        const statusText = response.statusText

        // eslint-disable-next-line no-console
        console.log(
          `[Client Request] ${method} ${url} - ${status} ${statusText}`,
        )

        return response
      },

      // Error handling interceptor - converts HTTP errors to structured BusinessError
      async ({ request, options, response, retryCount }) => {
        if (!response.ok) {
          const url = request.url
          const method = options.method || 'GET'

          if (shouldWaitForRetry(method, response.status, retryCount, options.retry)) {
            return response
          }

          // 401 自动跳转登录页（可通过 context.skipAuthRedirect 禁用）
          if (response.status === 401 && !options.context?.skipAuthRedirect && typeof window !== 'undefined') {
            window.location.href = '/login'
          }

          createErrorResponse(
            { url, method, status: response.status, statusText: response.statusText },
            null,
            options,
          )
        }

        return response
      },

      // Response data validation interceptor - checks response format
      async ({ response }) => {
        // Only validate JSON responses
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json') && response.ok) {
          try {
            // Clone response to peek at data without consuming the stream
            const clonedResponse = response.clone()
            const data = await clonedResponse.json()

            // Validate response structure (optional - can be customized)
            if (data && typeof data === 'object') {
              if ('success' in data && !data.success && 'code' in data) {
                // 业务错误已在 error-handler 中统一处理，此处仅做数据验证
              }
            }
          }
          catch (error) {
            // JSON 解析失败由请求库底层处理，此处静默忽略
            void error
          }
        }

        return response
      },
    ],
  },
})

export { http as httpClient }
