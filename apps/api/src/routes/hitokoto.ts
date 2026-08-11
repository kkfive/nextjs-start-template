import { ErrorShowType, hitokotoResponseSchema } from '@kkfive/contracts'
import { Hono } from 'hono'

const HITOKOTO_URL = 'https://international.v1.hitokoto.cn'

// 链式 .get()：让 typeof hitokotoRoutes 含路由 Schema，hc 才能推导 client.hitokoto
export const hitokotoRoutes = new Hono().get('/', async (c) => {
  const res = await fetch(`${HITOKOTO_URL}/?c=a`)
  if (!res.ok) {
    return c.json({
      success: false,
      code: res.status,
      message: 'hitokoto upstream error',
      data: null,
      errorShowType: ErrorShowType.ERROR_MESSAGE,
      requestId: '',
      timestamp: new Date().toISOString(),
    }, 502)
  }

  // 外部响应不可信，用 zod 校验后归一化；parse 失败交 app.onError 兜底
  const data = hitokotoResponseSchema.parse(await res.json())
  return c.json({
    success: true,
    data,
    code: 200,
    message: 'OK',
  })
})
