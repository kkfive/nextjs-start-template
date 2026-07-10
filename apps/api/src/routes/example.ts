import { zValidator } from '@hono/zod-validator'
import { contactFormSchema } from '@kkfive/contracts'
import { Hono } from 'hono'

// 链式：typeof 累积路由 Schema，hc 才能推导
export const exampleRoutes = new Hono()
  .post('/contact', zValidator('json', contactFormSchema), (c) => {
    const data = c.req.valid('json')
    return c.json({
      success: true,
      data: { received: true, name: data.name, email: data.email },
    })
  })
  .get('/schema-demo', (c) => {
    return c.json({
      success: true,
      data: {
        message: 'apps/api 演示 @kkfive/contracts 校验',
        endpoints: [
          'POST /example/contact — 用 contactFormSchema 校验请求体',
          'GET /example/schema-demo — 本说明',
        ],
      },
    })
  })
