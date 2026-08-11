// @vitest-environment node
// 验证 hc 注入契约：hc -> HttpService.request -> raw Response -> unwrapData
import type { AppType } from 'api'
import { BusinessError, HttpService } from '@kkfive/http-client'
import { createRpcClient, unwrapData } from '@kkfive/rpc'
import { expect, it, vi } from 'vitest'

const BASE = 'http://localhost:8787'

function mockResponse(body: unknown) {
  const http = new HttpService()
  const request = vi.spyOn(http.instance, 'request').mockImplementation(() => Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  ) as never)
  return { http, request }
}

it('hc GET hitokoto: ky 消费 hc fetch + raw Response + unwrapData', async () => {
  const { http, request } = mockResponse({
    success: true,
    data: { hitokoto: 'test quote' },
    code: 200,
    message: 'OK',
  })
  const client = createRpcClient<AppType>(http, BASE)
  const res = await client.hitokoto.$get()
  expect(res.status).toBe(200)
  expect(unwrapData(await res.json()).hitokoto).toBe('test quote')
  expect(request).toHaveBeenCalledWith(
    '/hitokoto',
    expect.objectContaining({
      prefix: BASE,
      responseParser: { responseReturn: 'raw' },
    }),
  )
})

it('hc POST scenario: json body 经 ky 透传 + 解包', async () => {
  const { http, request } = mockResponse({
    success: true,
    data: { a: 1, b: 2, token: '' },
    code: 200,
    message: 'OK',
  })
  const client = createRpcClient<AppType>(http, BASE)
  const res = await client.example.request.scenario.$post({ json: { scenario: 'success' } })
  const envelope = await res.json()
  if ('error' in envelope) {
    throw new Error('mock 响应不应命中 zod 解析错误分支')
  }
  expect(unwrapData(envelope)).toEqual({ a: 1, b: 2, token: '' })
  expect(request).toHaveBeenCalledWith(
    '/example/request/scenario',
    expect.objectContaining({ method: 'POST', prefix: BASE }),
  )
})

it('hc business-error: envelope success:false 抛 BusinessError', async () => {
  const { http } = mockResponse({
    success: false,
    code: 10086,
    message: '业务错误',
    data: null,
    errorShowType: 1,
    requestId: 'r',
    timestamp: 't',
  })
  const client = createRpcClient<AppType>(http, BASE)
  const res = await client.example.request.scenario.$post({ json: { scenario: 'business-error' } })
  const envelope = await res.json()
  // @hono/zod-validator 0.9 的 .json() 类型混入 ZodSafeParseError 分支；
  // mock 的是 raw Response，运行时不会命中该分支，用 `error` 字段收窄掉
  if ('error' in envelope) {
    throw new Error('mock 响应不应命中 zod 解析错误分支')
  }
  expect(() => unwrapData(envelope)).toThrow(BusinessError)
})
