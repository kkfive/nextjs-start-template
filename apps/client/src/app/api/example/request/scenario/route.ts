function makeErrorResponse(status: number, message: string) {
  return Response.json(
    {
      success: false,
      data: null,
      code: 10000,
      message,
      errorShowType: 2,
      requestId: 'requestId',
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

export async function POST(request: Request) {
  let body: { scenario?: string } | null = null

  try {
    body = await request.json()
  }
  catch {
    return makeErrorResponse(400, '参数错误')
  }

  const scenario = body?.scenario

  switch (scenario) {
    case 'success': {
      const xCustomId = request.headers.get('x-customer-id')
      return Response.json(
        {
          success: true,
          data: { a: 1, b: 2, token: xCustomId || '' },
          code: 200,
          message: 'OK',
        },
      )
    }
    case 'business-error': {
      return Response.json(
        {
          success: false,
          data: null,
          code: 10086,
          message: '业务逻辑错误',
          errorShowType: 2,
          requestId: 'requestId',
          timestamp: new Date().toISOString(),
        },
      )
    }
    case 'error-400':
      return makeErrorResponse(400, '参数错误')
    case 'error-401':
      return makeErrorResponse(401, '未登录')
    case 'error-404':
      return makeErrorResponse(404, '资源不存在')
    case 'error-500':
      return makeErrorResponse(500, '服务器错误')
    case 'error-503':
      return makeErrorResponse(503, '服务不可用')
    default:
      return makeErrorResponse(400, '参数错误')
  }
}
