import { expect, it } from 'vitest'

export const expectedServerRuntime = 'http-server'

it('represents the colocated http server runtime test', () => {
  expect(expectedServerRuntime).toBe('http-server')
})
