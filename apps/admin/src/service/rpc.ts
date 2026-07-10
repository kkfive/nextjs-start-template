import process from 'node:process'
import { createRpcClient } from '@kkfive/rpc'
import { serverClient } from './index.server'

/**
 * admin SSR 的 hc 客户端。复用 app 注入的服务端 HttpService 实例，
 * baseUrl 指向 apps/api（NEXT_PUBLIC_API_URL）。
 */
export const bizClient = createRpcClient(serverClient, process.env.NEXT_PUBLIC_API_URL || '/')
