import type { NextRequest } from 'next/server'
import { fail, ok } from '@kkfive/contracts'

// 主后端 Route Handler：按 delay/failRate 模拟延迟与随机失败，用于测试重试/超时机制。
export async function GET(request: NextRequest) {
  const delay = Number.parseInt(request.nextUrl.searchParams.get('delay') || '0', 10)
  const failRate = Number.parseInt(request.nextUrl.searchParams.get('failRate') || '0', 10)

  if (delay > 0)
    await new Promise(resolve => setTimeout(resolve, delay))

  if (failRate > 0 && Math.random() * 100 < failRate)
    return Response.json(fail(500, '模拟随机失败'), { status: 500 })

  return Response.json(ok({
    message: '配置测试响应',
    delay,
    failRate,
    timestamp: new Date().toISOString(),
  }))
}
