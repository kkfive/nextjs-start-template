import type { NextRequest } from 'next/server'
import { fail, ok } from '@kkfive/contracts'

// 主后端 Route Handler：按 mode 演示认证成功/失败，失败用动态 requestId 保持原有行为。
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('mode') || 'default'

  if (mode === 'success')
    return Response.json(ok({ message: '认证成功', user: { id: 1, name: 'Demo User' } }))

  // 动态 requestId（fail 第三参数），区别于默认固定占位
  return Response.json(fail(401, '未登录或登录已过期', `req-${Date.now()}`), { status: 401 })
}
