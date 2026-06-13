import { HttpResponse, http as mswHttp } from 'msw'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { TEST_BASE_URL } from '@/__tests__/mocks/handlers'
import { server } from '@/__tests__/mocks/server'

describe('client http service', () => {
  beforeAll(() => server.listen())

  afterEach(() => {
    server.resetHandlers()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterAll(() => server.close())

  it('should let retryable HTTP errors retry before converting to BusinessError', async () => {
    let requestCount = 0
    server.use(
      mswHttp.get(`${TEST_BASE_URL}/api/example/request/config`, () => {
        requestCount += 1

        if (requestCount === 1) {
          return HttpResponse.json(
            { success: false, code: 500, message: 'Retry me', data: null },
            { status: 500 },
          )
        }

        return HttpResponse.json({
          success: true,
          data: { message: 'Recovered' },
        })
      }),
    )
    vi.stubEnv('NEXT_PUBLIC_API_URL', TEST_BASE_URL)
    vi.stubEnv('SKIP_ENV_VALIDATION', 'true')

    const { httpClient } = await import('./index.client')
    const result = await httpClient.get('/api/example/request/config', { retry: 1 })

    expect(requestCount).toBe(2)
    expect(result).toEqual({
      success: true,
      data: { message: 'Recovered' },
    })
  })
})
