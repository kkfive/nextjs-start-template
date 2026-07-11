import { createRpcClient } from '@kkfive/rpc'
import { env } from '@/config/env'
import { httpServer } from './http-server'
import 'server-only'

/**
 * 服务端 hc 类型化 RPC 客户端。复用 server HttpService 实例的拦截器
 *（cookie/token 注入、日志、401 重定向、错误归一化）。baseUrl 走 secret
 * 服务端环境变量；dev 未配置时回退到本地 api，与 http-server 一致。
 */
export const rpcServer = createRpcClient(httpServer, env.API_BASE_URL ?? 'http://localhost:5373')
