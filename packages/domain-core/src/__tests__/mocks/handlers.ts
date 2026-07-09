import { http, HttpResponse } from 'msw'

// 测试环境的基础 URL（与 apps/client 保持一致）
export const TEST_BASE_URL = 'http://localhost:3000'

/**
 * MSW 请求处理器，覆盖 domain-core 示例模块的 HTTP 调用。
 */
export const handlers = [
  // hitokoto：模拟外部 API
  http.get('https://international.v1.hitokoto.cn', () => {
    return HttpResponse.json({
      id: 1,
      hitokoto: 'Test hitokoto message',
      type: 'a',
      from: 'Test Source',
      from_who: 'Test Author',
      creator: 'Test Creator',
      creator_uid: 1,
      reviewer: 0,
      uuid: 'test-uuid',
      commit_from: 'web',
      created_at: '1234567890',
      length: 20,
    })
  }),

  // request：统一场景端点
  http.post(`${TEST_BASE_URL}/api/example/request/scenario`, async ({ request }) => {
    const body = await request.json() as { scenario: string }
    const { scenario } = body

    switch (scenario) {
      case 'success':
        return HttpResponse.json({
          success: true,
          data: { a: 1, b: 2, token: 'test-token' },
        })
      case 'business-error':
        return HttpResponse.json({
          success: false,
          code: 1001,
          message: 'Business logic error',
          data: null,
          errorShowType: 2,
          requestId: 'req-123',
          timestamp: '2026-01-21T10:00:00Z',
        })
      case 'error-400':
        return HttpResponse.json(
          {
            success: false,
            code: 400,
            message: 'Bad Request',
            data: null,
            errorShowType: 2,
            requestId: 'req-400',
            timestamp: '2026-01-21T10:00:00Z',
          },
          { status: 400 },
        )
      case 'error-401':
        return HttpResponse.json(
          {
            success: false,
            code: 401,
            message: 'Unauthorized',
            data: null,
            errorShowType: 2,
            requestId: 'req-401',
            timestamp: '2026-01-21T10:00:00Z',
          },
          { status: 401 },
        )
      default:
        return HttpResponse.json(
          { success: false, error: 'Unknown scenario' },
          { status: 400 },
        )
    }
  }),
]
