import process from 'node:process'
import { serve } from '@hono/node-server'

import app from './app'

const port = Number(process.env.PORT) || 8787

serve({
  fetch: app.fetch,
  port,
})

process.stdout.write(`[apps/api] Hono server running on http://localhost:${port}\n`)
