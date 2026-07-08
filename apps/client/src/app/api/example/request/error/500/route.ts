export async function GET() {
  return Response.json(
    {
      success: false,
      data: null,
      code: 10000,
      message: '服务器错误',
      errorShowType: 2,
      requestId: 'requestId',
      timestamp: new Date().toISOString(),
    },
    { status: 500 },
  )
}
