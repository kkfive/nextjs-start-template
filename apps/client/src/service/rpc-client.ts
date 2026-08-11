import type { AppType } from 'api'
import { createRpcClient } from '@kkfive/rpc'
import { env } from '@/config/env'
import { httpClient } from './http-client'
import 'client-only'

/**
 * 浏览器侧 hc 类型化 RPC 客户端。复用 client HttpService 实例的拦截器
 *（retry / hooks / 401 跳转 / 错误归一化），baseUrl 取 public 环境变量；
 * 开发环境未配置时回退到仓库约定的外部 API 端口，绝不误发当前 Next origin。
 */
function getRpcBaseUrl() {
  if (env.NEXT_PUBLIC_API_URL)
    return env.NEXT_PUBLIC_API_URL

  const hostname = globalThis.location?.hostname
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1')
    throw new Error('NEXT_PUBLIC_API_URL is required outside local development')

  return 'http://localhost:8787'
}

export const rpcClient = createRpcClient<AppType>(httpClient, getRpcBaseUrl())
