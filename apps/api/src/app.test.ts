import { describe, expect, it } from 'vitest'

import { createApp } from './app'

const allowedOrigin = 'https://client.example.com'
const deniedOrigin = 'https://unknown.example.com'

describe('api app', () => {
  it('serves the health endpoint', async () => {
    const response = await createApp().request('/health')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      service: 'apps/api',
      status: 'ok',
    })
  })

  it('preserves the existing error envelope', async () => {
    const response = await createApp().request('/example/request/scenario', {
      body: JSON.stringify({ scenario: 'error-400' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      code: 400,
      data: null,
      message: '参数错误',
      success: false,
    })
  })

  it('allows a configured cross-origin request', async () => {
    const response = await createApp({
      corsOrigins: [allowedOrigin],
    }).request('/health', {
      headers: { origin: allowedOrigin },
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)
    expect(response.headers.get('Vary')).toContain('Origin')
  })

  it('reads configured origins from runtime bindings', async () => {
    const app = createApp()
    const response = await app.request('/health', {
      headers: { Origin: allowedOrigin },
    }, {
      CORS_ORIGINS: allowedOrigin,
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)
  })

  it('does not allow an unknown cross-origin request', async () => {
    const response = await createApp({
      corsOrigins: [allowedOrigin],
    }).request('/health', {
      headers: { origin: deniedOrigin },
    })

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('handles preflight requests for configured origins', async () => {
    const response = await createApp({
      corsOrigins: [allowedOrigin],
    }).request('/example/request/methods', {
      headers: {
        'Access-Control-Request-Headers': 'authorization,content-type',
        'Access-Control-Request-Method': 'POST',
        'origin': allowedOrigin,
      },
      method: 'OPTIONS',
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin)
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Authorization,Content-Type')
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })
})
