import type { AppType } from 'api'
import { createRpcClient } from '@kkfive/rpc'
import { env } from '@/config/env'
import { httpServer } from './http-server'
import 'server-only'

/**
 * 服务端 hc 类型化 RPC 客户端。复用 server HttpService 实例的拦截器
 *（cookie/token 注入、日志、401 重定向、错误归一化）。baseUrl 走 secret
 * 服务端环境变量；dev 未配置时回退到仓库约定的本地 api 端口。
 */
function getRpcBaseUrl() {
  if (env.API_BASE_URL)
    return env.API_BASE_URL
  if (env.NODE_ENV === 'production')
    throw new Error('API_BASE_URL is required in production')
  return 'http://localhost:8787'
}

export const rpcServer = createRpcClient<AppType>(httpServer, getRpcBaseUrl())
