import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error-handler'
import { exampleRoutes } from './routes/example'
import { healthRoutes } from './routes/health'

const app = new Hono()

// 中间件链：日志 -> 错误处理 -> 路由
app.use('*', logger())
app.onError(errorHandler)

app.route('/health', healthRoutes)
app.route('/example', exampleRoutes)

const port = Number(process.env.PORT) || 8787

export default {
  port,
  fetch: app.fetch,
}

console.log(`[apps/api] Hono server running on http://localhost:${port}`)
