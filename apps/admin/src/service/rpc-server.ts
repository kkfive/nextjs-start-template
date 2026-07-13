import type { AppType } from 'api'
import process from 'node:process'
import { createRpcClient } from '@kkfive/rpc'
import { httpServer } from './http-server'
import 'server-only'

/**
 * admin SSR 的 hc 客户端。复用 app 注入的服务端 HttpService 实例，
 * baseUrl 指向 apps/api（NEXT_PUBLIC_API_URL）。
 */
export const rpcServer = createRpcClient<AppType>(httpServer, process.env.NEXT_PUBLIC_API_URL || '/')
