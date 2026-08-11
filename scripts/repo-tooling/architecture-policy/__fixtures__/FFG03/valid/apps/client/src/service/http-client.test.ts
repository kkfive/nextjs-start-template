import { expect, it } from 'vitest'

export const expectedClientRuntime = 'http-client'

it('represents the colocated http client runtime test', () => {
  expect(expectedClientRuntime).toBe('http-client')
})
