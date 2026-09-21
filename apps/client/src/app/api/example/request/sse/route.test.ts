import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { POST } from './route'

describe('request SSE route', () => {
  it('返回可消费的 text/event-stream 帧', async () => {
    const request = new NextRequest('http://localhost/api/example/request/sse', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ count: 2, interval: 0, topic: 'test' }),
    })

    const response = await POST(request)
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(body).toContain('event: status')
    expect(body).toContain('id: 2')
    expect(body).toContain('"progress":100')
    expect(body).toContain('event: done')
  })
})
