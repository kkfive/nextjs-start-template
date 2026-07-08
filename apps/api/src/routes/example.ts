import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { contactFormSchema } from '@kkfive/contracts'

export const exampleRoutes = new Hono()

// 示例：用 @kkfive/contracts 的 schema 校验请求体
exampleRoutes.post('/contact', zValidator('json', contactFormSchema), (c) => {
  const data = c.req.valid('json')
  return c.json({
    success: true,
    data: {
      received: true,
      name: data.name,
      email: data.email,
    },
  })
})

// 示例：演示同进程直调 @kkfive/domain-core（不经 HttpService）
// 注意：domain-core 的 hitokoto controller 需要 HttpService（它请求外部 API）
// 这里仅展示 contract 校验流程，真实后端业务 controller 应直接操作 DB
exampleRoutes.get('/schema-demo', (c) => {
  return c.json({
    success: true,
    data: {
      message: 'apps/api 演示 @kkfive/contracts 校验与同进程直调模式',
      endpoints: [
        'POST /example/contact — 用 contactFormSchema 校验请求体',
        'GET /example/schema-demo — 本说明',
      ],
    },
  })
})
