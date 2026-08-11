import type { NextRequest } from 'next/server'
import { ok } from '@kkfive/contracts'

// 主后端 Route Handler：各 HTTP 方法回显 method/message/query|body/headers，演示方法覆盖。
export async function GET(request: NextRequest) {
  return Response.json(ok({
    method: 'GET',
    message: '获取数据成功',
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
  }))
}

export async function POST(request: NextRequest) {
  const body = await readBody(request)
  return Response.json(ok({
    method: 'POST',
    message: '创建数据成功',
    receivedBody: body,
    headers: Object.fromEntries(request.headers.entries()),
  }))
}

export async function PUT(request: NextRequest) {
  const body = await readBody(request)
  return Response.json(ok({
    method: 'PUT',
    message: '全量更新成功',
    receivedBody: body,
    headers: Object.fromEntries(request.headers.entries()),
  }))
}

export async function DELETE(request: NextRequest) {
  return Response.json(ok({
    method: 'DELETE',
    message: '删除数据成功',
    id: request.nextUrl.searchParams.get('id') || 'unknown',
    headers: Object.fromEntries(request.headers.entries()),
  }))
}

export async function PATCH(request: NextRequest) {
  const body = await readBody(request)
  return Response.json(ok({
    method: 'PATCH',
    message: '部分更新成功',
    receivedBody: body,
    headers: Object.fromEntries(request.headers.entries()),
  }))
}

async function readBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json()
  }
  catch {
    return null
  }
}
