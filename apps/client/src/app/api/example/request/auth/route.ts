export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') || 'default'

  // mode=success: 模拟已认证
  if (mode === 'success') {
    return Response.json({
      success: true,
      data: {
        message: '认证成功',
        user: { id: 1, name: 'Demo User' },
      },
    })
  }

  // mode=default or mode=skip: 返回 401
  return Response.json(
    {
      success: false,
      code: 401,
      message: '未登录或登录已过期',
      data: null,
      errorShowType: 2,
      requestId: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
    { status: 401 },
  )
}
