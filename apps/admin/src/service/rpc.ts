import process from 'node:process'
import { createBizClient } from '@kkfive/biz'

/**
 * admin SSR 的 hc 客户端。baseUrl 指向 apps/api（NEXT_PUBLIC_API_URL）。
 */
export const bizClient = createBizClient(process.env.NEXT_PUBLIC_API_URL || '/')
