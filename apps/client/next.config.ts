import type { NextConfig } from 'next'
import { withRepoConfig } from '@kkfive/nextjs-config'

const config = withRepoConfig({
  sassOptions: {},
} satisfies NextConfig)

export default config
