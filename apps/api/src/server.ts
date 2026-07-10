import app from './app'

const port = Number(process.env.PORT) || 8787

console.log(`[apps/api] Hono server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
