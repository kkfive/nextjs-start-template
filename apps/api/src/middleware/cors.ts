import type { Context } from 'hono'
import { cors } from 'hono/cors'

const allowHeaders = ['Authorization', 'Content-Type']
const allowMethods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

export function parseCorsOrigins(value: string | undefined) {
  if (!value)
    return []

  return [...new Set(value.split(',').map(origin => origin.trim()).filter(Boolean))]
}

export function readCorsOrigins(context: Context) {
  const bindings: unknown = context.env
  if (typeof bindings !== 'object' || bindings === null || !('CORS_ORIGINS' in bindings))
    return []

  const value = bindings.CORS_ORIGINS
  return parseCorsOrigins(typeof value === 'string' ? value : undefined)
}

export function createCorsMiddleware(
  fallbackOrigins: readonly string[],
  resolveOrigins: (context: Context) => readonly string[] = () => [],
) {
  const fallbackAllowedOrigins = new Set(fallbackOrigins)

  return cors({
    allowHeaders,
    allowMethods,
    origin: (origin, context) => {
      const runtimeAllowedOrigins = new Set(resolveOrigins(context))
      return runtimeAllowedOrigins.has(origin) || fallbackAllowedOrigins.has(origin) ? origin : null
    },
  })
}
