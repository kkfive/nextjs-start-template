import type { NextConfig } from 'next'
import { withRepoConfig } from '@kkfive/nextjs-config'

const config = withRepoConfig({} satisfies NextConfig)

export default config
