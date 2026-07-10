import { createRpcClient } from '@kkfive/rpc'
import { env } from '@/config/env'
import { httpClient } from './index.client'

/**
 * hc 类型化 RPC 客户端。复用 app 注入的浏览器 HttpService 实例（retry / hooks /
 * 401 跳转 / 错误归一化全程生效），跨 CSR / SSR 通用。
 */
export const bizClient = createRpcClient(httpClient, env.NEXT_PUBLIC_API_URL || '/')
