import { HttpService } from '@kkfive/http-client'
import 'server-only'

// admin 服务端 HttpService 实例（SSR 场景）
// 实际项目应注入鉴权 header、API base 等
export const httpServer = new HttpService()
