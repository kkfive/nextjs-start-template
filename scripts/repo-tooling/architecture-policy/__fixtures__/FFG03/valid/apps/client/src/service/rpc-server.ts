import type { AppType } from 'api'
import 'server-only'

export const rpcServer = createRpcClient<AppType>()
