import type { AppType } from 'api'
import 'client-only'

export type RpcClientOptions = {
  baseUrl: string
}

function getBaseUrl() {
  return '/'
}

export const rpcClient = createRpcClient<AppType>(getBaseUrl())
