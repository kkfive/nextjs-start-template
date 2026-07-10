import { ErrorShowType, hitokotoResponseSchema } from '@kkfive/contracts'
import { Hono } from 'hono'

const HITOKOTO_URL = 'https://international.v1.hitokoto.cn'

export const hitokotoRoutes = new Hono()

/**
 * 代理外部一言 API。
 * 服务端聚合（而非前端直连），便于未来加缓存、鉴权、错误归一化、隐藏上游细节。
 */
hitokotoRoutes.get('/', async (c) => {
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
