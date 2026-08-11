import type { NextRequest } from 'next/server'
import { fail, ok, scenarioSchema } from '@kkfive/contracts'

// 主后端 Route Handler：按 scenario 分支返回不同 envelope，演示业务错误与 HTTP 错误。
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  }
  catch {
    return Response.json(fail(400, '参数错误'), { status: 400 })
  }

  let scenario: string
  try {
    scenario = scenarioSchema.parse(body).scenario
  }
  catch {
    return Response.json(fail(400, '参数错误'), { status: 400 })
  }

  const xCustomerId = request.headers.get('x-customer-id') || ''
  switch (scenario) {
    case 'success':
      return Response.json(ok({ a: 1, b: 2, token: xCustomerId }))
    case 'business-error':
      // 业务错误：HTTP 200，success: false
      return Response.json(fail(10086, '业务逻辑错误'))
    case 'error-400':
      return Response.json(fail(400, '参数错误'), { status: 400 })
    case 'error-401':
      return Response.json(fail(401, '未登录'), { status: 401 })
    case 'error-404':
      return Response.json(fail(404, '资源不存在'), { status: 404 })
    case 'error-500':
      return Response.json(fail(500, '服务器错误'), { status: 500 })
    case 'error-503':
      return Response.json(fail(503, '服务不可用'), { status: 503 })
    default:
      return Response.json(fail(400, '参数错误'), { status: 400 })
  }
}
