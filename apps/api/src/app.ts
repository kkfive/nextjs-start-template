import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { createCorsMiddleware, readCorsOrigins } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import { exampleRoutes } from './routes/example'
import { requestRoutes } from './routes/example/request'
import { healthRoutes } from './routes/health'
import { hitokotoRoutes } from './routes/hitokoto'

export type AppOptions = {
  corsOrigins?: readonly string[]
}

// 单链式表达式：让 typeof app 累积路由类型，hc<AppType> 才能推导出 typed client
export function createApp(options: AppOptions = {}) {
  return new Hono()
    .use('*', createCorsMiddleware(
      options.corsOrigins ?? [],
      context => readCorsOrigins(context),
    ))
    .use('*', logger())
    .onError(errorHandler)
    .route('/health', healthRoutes)
    .route('/hitokoto', hitokotoRoutes)
    .route('/example', exampleRoutes)
    .route('/example/request', requestRoutes)
}

const app = createApp()

/**
 * 前端 hc<AppType> 的类型链源头（type-only 消费，不引入运行时）。
 * packages/biz 经此获得端到端类型安全的 RPC 调用。
 *
 * 本文件保持纯净（不含 process 等运行时副作用），便于跨包 type-only 消费。
 */
export type AppType = typeof app

export default app
