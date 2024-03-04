import consola from 'consola'
import { getUUID } from '@/utils/tools'
import type { MockAPI } from '@/services/mock/typings'

// todo: 二次封装fetch
export async function request<T>(input: string, init?: RequestInit | undefined): Promise<MockAPI.BaseResponse<T>> {
  const uuid = getUUID()
  try {
    consola.info(`fetch请求开始: ${uuid}`, input, init)
    const result = await fetch(input, init)
    consola.info(`fetch请求结束: ${uuid}`, input, init)
    return await result.json()
  }
  catch (e) {
    consola.error(`fetch请求失败: ${uuid}`, input, init, e)
    return Promise.reject(e)
  }
}
