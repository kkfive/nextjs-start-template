export async function GET() {
  // 请求成功（http 状态码为 200），但是业务逻辑错误
  return Response.json(
    {
      success: false,
      data: null,
      code: 10000,
      message: '参数错误',
      errorShowType: 2,
      requestId: 'requestId',
      timestamp: new Date().toISOString(),
    },
    { status: 400 },
  )
}
