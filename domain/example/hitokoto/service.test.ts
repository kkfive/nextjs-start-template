import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { server } from '@/__tests__/mocks/server'
import { HttpService } from '@/lib/request'
import { service } from './service'

describe('hitokoto service', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should fetch hitokoto data', async () => {
    const http = new HttpService()

    const response = await service.getData(http) as unknown as Response
    const data = await response.json()

    expect(data).toHaveProperty('hitokoto')
    expect(data).toHaveProperty('from')
    expect(data).toHaveProperty('type')
  })

  it('should return expected data structure', async () => {
    const http = new HttpService()

    const response = await service.getData(http) as unknown as Response
    const data = await response.json()

    // Verify the mocked response structure
    expect(data.hitokoto).toBe('Test hitokoto message')
    expect(data.from).toBe('Test Source')
    expect(data.from_who).toBe('Test Author')
  })

  it('should accept custom request options', async () => {
    const http = new HttpService()

    // Service should accept options without throwing
    const response = await service.getData(http, {
      timeout: 5000,
    })

    expect(response).toBeDefined()
  })
})
