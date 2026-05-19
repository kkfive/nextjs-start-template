export async function GET(request: Request) {
  const url = new URL(request.url)
  const delay = Number.parseInt(url.searchParams.get('delay') || '0', 10)
  const failRate = Number.parseInt(url.searchParams.get('failRate') || '0', 10)

  // Simulate delay for timeout testing
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Simulate flaky responses for retry testing
  if (failRate > 0) {
    const random = Math.random() * 100
    if (random < failRate) {
      return Response.json(
        {
          success: false,
          code: 500,
          message: '模拟随机失败，用于测试重试机制',
          data: null,
        },
        { status: 500 },
      )
    }
  }

  return Response.json({
    success: true,
    data: {
      message: '配置测试响应',
      delay,
      failRate,
      timestamp: new Date().toISOString(),
    },
  })
}
