import { zValidator } from '@hono/zod-validator'
import { ErrorShowType, scenarioSchema } from '@kkfive/contracts'
import { Hono } from 'hono'
import { handleSseStream } from './sse'

const now = () => new Date().toISOString()

function ok<T>(data: T, message = 'OK') {
  return { success: true as const, data, code: 200, message }
}

function fail(code: number, message: string) {
  return {
    success: false as const,
    data: null,
    code,
    message,
    errorShowType: ErrorShowType.ERROR_MESSAGE,
    requestId: 'requestId',
    timestamp: now(),
  }
}

// 链式：typeof 累积所有路由 Schema，hc<AppType> 才能推导 client.example.request.*
export const requestRoutes = new Hono()
  .post('/scenario', zValidator('json', scenarioSchema), (c) => {
    const { scenario } = c.req.valid('json')
    const xCustomId = c.req.header('x-customer-id') || ''
    switch (scenario) {
      case 'success':
        return c.json(ok({ a: 1, b: 2, token: xCustomId }))
      case 'business-error':
        return c.json(fail(10086, '业务逻辑错误'))
      case 'error-400':
        return c.json(fail(400, '参数错误'), 400)
      case 'error-401':
        return c.json(fail(401, '未登录'), 401)
      case 'error-404':
        return c.json(fail(404, '资源不存在'), 404)
      case 'error-500':
        return c.json(fail(500, '服务器错误'), 500)
      case 'error-503':
        return c.json(fail(503, '服务不可用'), 503)
      default:
        return c.json(fail(400, '参数错误'), 400)
    }
  })
  .get('/methods', (c) => {
    const url = new URL(c.req.url)
    return c.json(ok({
      method: 'GET',
      message: '获取数据成功',
      query: Object.fromEntries(url.searchParams.entries()),
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    }))
  })
  .post('/methods', async (c) => {
    const body = await c.req.json().catch(() => null)
    return c.json(ok({
      method: 'POST',
      message: '创建数据成功',
      receivedBody: body,
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    }))
  })
  .put('/methods', async (c) => {
    const body = await c.req.json().catch(() => null)
    return c.json(ok({
      method: 'PUT',
      message: '全量更新成功',
      receivedBody: body,
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    }))
  })
  .delete('/methods', (c) => {
    const url = new URL(c.req.url)
    return c.json(ok({
      method: 'DELETE',
      message: '删除数据成功',
      id: url.searchParams.get('id') || 'unknown',
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    }))
  })
  .patch('/methods', async (c) => {
    const body = await c.req.json().catch(() => null)
    return c.json(ok({
      method: 'PATCH',
      message: '部分更新成功',
      receivedBody: body,
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    }))
  })
  .get('/config', async (c) => {
    const url = new URL(c.req.url)
    const delay = Number.parseInt(url.searchParams.get('delay') || '0', 10)
    const failRate = Number.parseInt(url.searchParams.get('failRate') || '0', 10)

    if (delay > 0)
      await new Promise(resolve => setTimeout(resolve, delay))

    if (failRate > 0 && Math.random() * 100 < failRate) {
      return c.json(fail(500, '模拟随机失败，用于测试重试机制'), 500)
    }

    return c.json(ok({ message: '配置测试响应', delay, failRate, timestamp: now() }))
  })
  .get('/auth', (c) => {
    const url = new URL(c.req.url)
    const mode = url.searchParams.get('mode') || 'default'

    if (mode === 'success')
      return c.json(ok({ message: '认证成功', user: { id: 1, name: 'Demo User' } }))

    return c.json({
      success: false,
      code: 401,
      message: '未登录或登录已过期',
      data: null,
      errorShowType: ErrorShowType.ERROR_MESSAGE,
      requestId: `req-${Date.now()}`,
      timestamp: now(),
    }, 401)
  })
  .post('/sse', handleSseStream)
