import { http, HttpResponse } from 'msw'

// 测试环境的基础 URL
export const TEST_BASE_URL = 'http://localhost:3000'

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
  // 示例：模拟 example ping 端点（对应 apps/api 的 GET /example/ping）
  http.get(`${TEST_BASE_URL}/api/example/ping`, () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'example ping', time: '2026-01-01T00:00:00Z' },
    })
  }),
]
