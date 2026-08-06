import process from 'node:process'

import { createApp } from '../src/app'
import { parseCorsOrigins } from '../src/middleware/cors'

export default createApp({
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
})
