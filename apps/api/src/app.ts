import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error-handler'
import { exampleRoutes } from './routes/example'
import { requestRoutes } from './routes/example/request'
import { healthRoutes } from './routes/health'
import { hitokotoRoutes } from './routes/hitokoto'

const app = new Hono()

// 中间件链：日志 -> 错误处理 -> 路由
app.use('*', logger())
app.onError(errorHandler)

app.route('/health', healthRoutes)
app.route('/hitokoto', hitokotoRoutes)
app.route('/example', exampleRoutes)
app.route('/example/request', requestRoutes)

const port = Number(process.env.PORT) || 8787

/**
 * 前端 hc<AppType> 的类型链源头（type-only 消费，不引入运行时）。
 * packages/biz 经此获得端到端类型安全的 RPC 调用。
 */
export type AppType = typeof app

export default {
  port,
  fetch: app.fetch,
}

console.log(`[apps/api] Hono server running on http://localhost:${port}`)
