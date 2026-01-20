import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW server instance for Node.js environment (tests)
 *
 * @example
 * ```ts
 * // In vitest.setup.ts or test file
 * import { server } from '@/__tests__/mocks/server'
 *
 * beforeAll(() => server.listen())
 * afterEach(() => server.resetHandlers())
 * afterAll(() => server.close())
 * ```
 */
export const server = setupServer(...handlers)
