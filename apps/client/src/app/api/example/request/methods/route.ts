export async function GET(request: Request) {
  const url = new URL(request.url)
  return Response.json({
    success: true,
    data: {
      method: 'GET',
      message: '获取数据成功',
      query: Object.fromEntries(url.searchParams.entries()),
      headers: Object.fromEntries(request.headers.entries()),
    },
  })
}

export async function POST(request: Request) {
  let body = null
  try {
    body = await request.json()
  }
  catch {
    body = null
  }

  return Response.json({
    success: true,
    data: {
      method: 'POST',
      message: '创建数据成功',
      receivedBody: body,
      headers: Object.fromEntries(request.headers.entries()),
    },
  })
}

export async function PUT(request: Request) {
  let body = null
  try {
    body = await request.json()
  }
  catch {
    body = null
  }

  return Response.json({
    success: true,
    data: {
      method: 'PUT',
      message: '全量更新成功',
      receivedBody: body,
      headers: Object.fromEntries(request.headers.entries()),
    },
  })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  return Response.json({
    success: true,
    data: {
      method: 'DELETE',
      message: '删除数据成功',
      id: url.searchParams.get('id') || 'unknown',
      headers: Object.fromEntries(request.headers.entries()),
    },
  })
}

export async function PATCH(request: Request) {
  let body = null
  try {
    body = await request.json()
  }
  catch {
    body = null
  }

  return Response.json({
    success: true,
    data: {
      method: 'PATCH',
      message: '部分更新成功',
      receivedBody: body,
      headers: Object.fromEntries(request.headers.entries()),
    },
  })
}
