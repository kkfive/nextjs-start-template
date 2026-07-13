import type { AppType } from 'api'
import { createRpcClient } from '@kkfive/rpc'
import { env } from '@/config/env'
import { httpClient } from './http-client'
import 'client-only'

/**
 * 浏览器侧 hc 类型化 RPC 客户端。复用 client HttpService 实例的拦截器
 *（retry / hooks / 401 跳转 / 错误归一化），baseUrl 取 public 环境变量。
 */
export const rpcClient = createRpcClient<AppType>(httpClient, env.NEXT_PUBLIC_API_URL || '/')
