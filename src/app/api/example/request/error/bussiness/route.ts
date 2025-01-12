import { cookies, headers } from 'next/headers'

export async function GET() {
  const headersStore = await headers()
  const cookieStore = await cookies()

  const header: Record<string, any> = {}
  headersStore.entries().forEach(([key, value]) => {
    header[key] = value
  })
  const cookie: Record<string, any> = {}
  cookieStore.getAll().forEach((c) => {
    cookie[c.name] = c.value
  })

  // 请求成功（http 状态码为 200），但是业务逻辑错误
  return Response.json(
    {
      success: false,
      data: {
        cookie,
        header,
      },
      code: 10086,
      message: '业务逻辑错误',
      errorShowType: 2,
      requestId: 'requestId',
      timestamp: new Date().toISOString(),
    },
  )
}
