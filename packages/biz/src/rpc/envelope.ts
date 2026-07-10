import type { HttpResponse } from '@kkfive/contracts'
import { BusinessError } from '@kkfive/http-client'

/**
 * 解析 api envelope：成功返回 data，失败抛 BusinessError。
 * hc 的 $get/$post 返回 ClientResponse，.json() 得 HttpResponse<T>。
 *
 * 返回 NonNullable<T>：成功态 data 必非 null。hc 对 route 返回常推导为宽对象
 *（success: boolean），使 T 误含 null；成功语义保证 data 非空，故收紧类型。
 */
export function unwrapData<T>(envelope: HttpResponse<T>): NonNullable<T> {
  if (!envelope.success) {
    throw new BusinessError(envelope.message, { code: envelope.code })
  }
  return envelope.data as NonNullable<T>
}
