import type { HttpService } from './index'
import type { HttpResponseError, RequestResponse, ResponseInterceptorConfig } from './type'
import { RequestError } from './error'
/**
 * 数据转换拦截器
 */
export function transformResponseInterceptor(response: RequestResponse) {
  // 转换响应数据
  const isOnlyData = response.config?.meta?.isOnlyData
  const isTransformResponse = response.config?.meta?.isTransformResponse
  // 不处理响应，即返回原始 axios 响应
  if (isTransformResponse) {
  // 处理响应
    if (isOnlyData && response.config?.meta?.dataField) {
      return response.data[response.config?.meta?.dataField]
    }
    return response.data
  }
  return response
}

/**
 * 认证响应拦截器
 */
export function authenticateResponseInterceptor({
  client,
  doReAuthenticate,
  doRefreshToken,
  enableRefreshToken,
  formatToken,
}: {
  client: HttpService
  doReAuthenticate: () => Promise<void>
  doRefreshToken: () => Promise<string>
  enableRefreshToken: boolean
  formatToken: (token: string) => null | string
}): ResponseInterceptorConfig {
  return {
    rejected: async (error) => {
      const { config, response } = error
      // 如果不是 401 错误，直接抛出异常
      if (response?.status !== 401) {
        throw error
      }
      // 判断是否启用了 refreshToken 功能
      // 如果没有启用或者已经是重试请求了，直接跳转到重新登录
      if (!enableRefreshToken || config.__isRetryRequest) {
        await doReAuthenticate()
        throw error
      }
      // 如果正在刷新 token，则将请求加入队列，等待刷新完成
      if (client.isRefreshing) {
        return new Promise((resolve) => {
          client.refreshTokenQueue.push((newToken: string) => {
            config.headers.Authorization = formatToken(newToken)
            resolve(client.request(config))
          })
        })
      }

      // 标记开始刷新 token
      client.isRefreshing = true
      // 标记当前请求为重试请求，避免无限循环
      config.__isRetryRequest = true

      try {
        const newToken = await doRefreshToken()

        // 处理队列中的请求
        client.refreshTokenQueue.forEach(callback => callback(newToken))
        // 清空队列
        client.refreshTokenQueue = []

        return client.request(error.config)
      }
      catch (refreshError) {
        // 如果刷新 token 失败，处理错误（如强制登出或跳转登录页面）
        client.refreshTokenQueue.forEach(callback => callback(''))
        client.refreshTokenQueue = []
        console.error('Refresh token failed, please login again.')
        await doReAuthenticate()

        throw refreshError
      }
      finally {
        client.isRefreshing = false
      }
    },
  }
}

/**
 * 验证业务响应拦截器
 */
export function validateBusinessResponseInterceptor(response: RequestResponse<HttpResponseError<any>>) {
  if (!response.data.success) {
    throw new RequestError(response.data.message, {
      status: response.status,
      response: response as RequestResponse<HttpResponseError<any>, any>,
      config: response.config,
    })
  }
  return response
}
