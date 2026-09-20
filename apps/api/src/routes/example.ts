import { examplePingSchema } from '@kkfive/contracts'

import { Hono } from 'hono'

// 链式：typeof 累积路由 Schema，hc 才能推导
// example 是模板保留的最简示例：一条跨包 contract + 一个端点，
// 演示「contract 校验输入/输出 → hc 类型化调用」的完整链路。接管时可整体删除。
export const exampleRoutes = new Hono()
  .get('/ping', (c) => {
    const data = examplePingSchema.parse({
      message: 'example ping',
      time: new Date().toISOString(),
    })
    return c.json({ success: true, data })
  })
