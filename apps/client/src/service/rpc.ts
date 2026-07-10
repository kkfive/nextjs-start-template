import { createBizClient } from '@kkfive/biz'
import { env } from '@/config/env'

/**
 * hc 类型化 RPC 客户端。fetch 注入 interceptor（见 @kkfive/biz createBizClient），
 * 跨 CSR / SSR 通用（fetch 通用，hooks 无 window 依赖）。
 */
export const bizClient = createBizClient(env.NEXT_PUBLIC_API_URL || '/')
