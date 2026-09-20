import { Hono } from 'hono'

// 链式：typeof 累积路由 Schema，hc 才能推导
// example 保留为最简示例端点，见 README「接管本项目」
export const exampleRoutes = new Hono()
  .get('/ping', (c) => {
    return c.json({
      success: true,
      data: { message: 'example ping', time: new Date().toISOString() },
    })
  })
