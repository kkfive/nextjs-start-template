export async function GET(request: Request) {
  const xCustomId = request.headers.get('x-customer-id')

  // 一切正常，返回数据
  return Response.json(
    {
      success: true,
      data: { a: 1, b: 2, token: xCustomId || '' },
    },
  )
}
