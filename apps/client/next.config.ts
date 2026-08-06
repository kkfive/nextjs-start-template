import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withRepoConfig } from '@kkfive/nextjs-config'

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

const config = withRepoConfig({
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  sassOptions: {},
} satisfies NextConfig)

export default config
