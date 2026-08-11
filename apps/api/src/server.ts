import process from 'node:process'
import { serve } from '@hono/node-server'

import { createApp } from './app'
import { parseCorsOrigins } from './middleware/cors'

const port = Number(process.env.PORT) || 8787
const app = createApp({
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
})

serve({
  fetch: app.fetch,
  port,
})

process.stdout.write(`[apps/api] Hono server running on http://localhost:${port}\n`)
