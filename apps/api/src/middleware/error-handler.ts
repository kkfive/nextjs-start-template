import type { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('[API Error]', err)

  // 项目错误类映射（未来对接 @kkfive/contracts 的 ErrorResponseSchema）
  return c.json({
    success: false,
    code: 500,
    message: err.message || 'internal_error',
    requestId: c.get('requestId') ?? '',
    timestamp: new Date().toISOString(),
  }, 500)
}
