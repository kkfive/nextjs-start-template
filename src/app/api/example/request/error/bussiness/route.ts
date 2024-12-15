export async function GET() {
  // 请求成功（http 状态码为 200），但是业务逻辑错误
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