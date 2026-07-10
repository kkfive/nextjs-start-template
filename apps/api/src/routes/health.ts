import { Hono } from 'hono'

// 链式 .get()：typeof 含路由 Schema，hc 才能推导
export const healthRoutes = new Hono().get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'apps/api',
    timestamp: new Date().toISOString(),
  })
})
