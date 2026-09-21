import type { NextRequest } from 'next/server'
import { fail, hitokotoResponseSchema, ok } from '@kkfive/contracts'

const HITOKOTO_URL = 'https://international.v1.hitokoto.cn'

// 主后端 Route Handler：代理外部一言，路由层归一化 + zod 校验后返回 envelope。
export async function GET(_request: NextRequest) {
  try {
    // cache: 'no-store' —— 代理路由必须每次取最新上游数据，不走 Next 数据缓存
    const res = await fetch(`${HITOKOTO_URL}/?c=a`, { cache: 'no-store' })
    if (!res.ok)
      return Response.json(fail(502, 'hitokoto upstream error'), { status: 502 })

    // 路由层归一化（domain rule：外部响应不可信）：上游会把 from_who/from/creator
    // 等字段返回为 null，而 schema 期望 string，统一 null → '' 后再校验。
    const raw = await res.json() as Record<string, unknown>
    const normalized = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v ?? '']),
    )
    const data = hitokotoResponseSchema.parse(normalized)
    return Response.json(ok(data))
  }
  catch {
    return Response.json(fail(500, 'hitokoto 解析失败'), { status: 500 })
  }
}
