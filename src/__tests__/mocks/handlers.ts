import { http, HttpResponse } from 'msw'

/**
 * MSW 请求处理器，用于模拟 API 端点
 *
 * @example
 * ```ts
 * // 添加新的处理器
 * handlers.push(
 *   http.get('/api/users', () => {
 *     return HttpResponse.json([{ id: 1, name: 'John' }])
 *   })
 * )
 * ```
 */
export const handlers = [
  // 示例：模拟 hitokoto API
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

  // 示例：模拟内部 API 成功端点
  http.get('http://localhost:3000/api/example/request/success', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Success response' },
    })
  }),

  // 示��：模拟内部 API 错误端点
  http.get('http://localhost:3000/api/example/request/error/400', () => {
    return HttpResponse.json(
      { success: false, error: 'Bad Request' },
      { status: 400 },
    )
  }),

  http.get('http://localhost:3000/api/example/request/error/401', () => {
    return HttpResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }),

  // Unified scenario endpoint for controller tests
  http.post('http://localhost:3000/api/example/request/scenario', async ({ request }) => {
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
