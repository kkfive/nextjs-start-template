// @vitest-environment node
// 端到端验证 hc 注入：hc -> createRpcClient(http.instance) -> ky responseReturn:raw -> 真实 HTTP server
// 用 node http server mock api 响应，验证注入的 HttpService 实例真实消费 RequestInit 并返回 Response
import { createServer } from 'node:http'
import { BusinessError, HttpService } from '@kkfive/http-client'
import { createRpcClient, unwrapData } from '@kkfive/rpc'
import { afterAll, beforeAll, expect, it } from 'vitest'

const BASE = 'http://localhost:8787'
let server: ReturnType<typeof createServer>

beforeAll(async () => {
  server = createServer((req, res) => {
    const json = (code: number, body: unknown) => {
      res.writeHead(code, { 'content-type': 'application/json' })
      res.end(JSON.stringify(body))
    }
    if (req.url?.startsWith('/hitokoto')) {
      return json(200, { success: true, data: { hitokoto: 'test quote', type: 'a', from: '', from_who: '', creator: '', creator_uid: 0, reviewer: 0, commit_from: '', created_at: '', length: 0, uuid: '', id: 1 }, code: 200, message: 'OK' })
    }
    if (req.url?.includes('/scenario')) {
      let body = ''
      req.on('data', c => body += c)
      req.on('end', () => {
        const { scenario } = JSON.parse(body || '{}')
        if (scenario === 'business-error')
          return json(200, { success: false, code: 10086, message: '业务错误', data: null, errorShowType: 1, requestId: 'r', timestamp: 't' })
        return json(200, { success: true, data: { a: 1, b: 2, token: '' }, code: 200, message: 'OK' })
      })
      return
    }
    json(404, {})
  })
  await new Promise<void>(r => server.listen(8787, r))
})
afterAll(() => server.close())

it('hc GET hitokoto: ky 消费 hc fetch + raw Response + unwrapData', async () => {
  const client = createRpcClient(new HttpService(), BASE)
  const res = await client.hitokoto.$get()
  expect(res.status).toBe(200)
  expect(unwrapData(await res.json()).hitokoto).toBe('test quote')
})

it('hc POST scenario: json body 经 ky 透传 + 解包', async () => {
  const client = createRpcClient(new HttpService(), BASE)
  const res = await client.example.request.scenario.$post({ json: { scenario: 'success' } })
  expect(unwrapData(await res.json())).toEqual({ a: 1, b: 2, token: '' })
})

it('hc business-error: envelope success:false 抛 BusinessError', async () => {
  const client = createRpcClient(new HttpService(), BASE)
  const res = await client.example.request.scenario.$post({ json: { scenario: 'business-error' } })
  const envelope = await res.json()
  expect(() => unwrapData(envelope)).toThrow(BusinessError)
})
