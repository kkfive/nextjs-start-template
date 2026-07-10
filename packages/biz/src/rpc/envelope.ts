import type { HttpResponse } from '@kkfive/contracts'
import { BusinessError } from '@kkfive/http-client'

/**
 * 解析 api envelope：成功返回 data，失败抛 BusinessError。
 * hc 的 $get/$post 返回 ClientResponse，.json() 得 HttpResponse<T>。
 */
export function unwrapData<T>(envelope: HttpResponse<T>): T {
  if (!envelope.success) {
    throw new BusinessError(envelope.message, { code: envelope.code })
  }
  return envelope.data
}
