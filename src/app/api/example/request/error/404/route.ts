export async function GET() {
  return Response.json(
    {
      success: false,
      data: null,
      code: 10000,
      message: '资源不存在',
      errorShowType: 2,
      requestId: 'requestId',
      timestamp: new Date().toISOString(),
    },
    { status: 404 },
  )
}
