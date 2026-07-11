import type { Hitokoto, HttpResponse } from '@kkfive/contracts'
import type { HttpService } from '@kkfive/http-client'
import { unwrapData } from '@kkfive/rpc'

/**
 * 获取一言（主通道：client Route Handler /api/hitokoto）。
 * 端无关——server 传 httpServer，client 传 httpClient。
 */
export async function getHitokoto(http: HttpService) {
  return unwrapData(await http.get<HttpResponse<Hitokoto>>('/api/hitokoto'))
}
