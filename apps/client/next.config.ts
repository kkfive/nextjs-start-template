import type { NextConfig } from 'next'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { withRepoConfig } from '@kkfive/nextjs-config'

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

const config = withRepoConfig({
  // Vercel 有自己的 nft 追踪机制；standalone 在其构建机上会触发 next-server.js.nft.json ENOENT
  output: process.env.VERCEL ? undefined : 'standalone',
  outputFileTracingRoot: monorepoRoot,
  sassOptions: {},
} satisfies NextConfig)

export default config
