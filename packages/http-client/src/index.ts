/**
 * @kkfive/http-client —— HTTP 抽象（HttpService 接口/基础类、错误类）。
 *
 * 只定义抽象，不含具体运行环境实现。实例由各 app 注入：
 * - apps/client 注入浏览器 fetch 实例
 * - apps/admin 注入服务端实例
 * - apps/api（Hono）独立后端，不经 HttpService
 */

export * from './type'
export { HttpService } from './http-service'
export { BusinessError, type BusinessErrorOptions } from './error'
export { createErrorResponse, type ErrorContext } from './error-handler'

// 透传 @kkfive/request 的运行时工具，让消费方无需直接依赖 @kkfive/request
export { createClient, isHTTPError } from '@kkfive/request'
export type { SSEConfig, SSEEvent } from '@kkfive/request'
