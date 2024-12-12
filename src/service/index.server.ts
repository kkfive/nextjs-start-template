import type { RequestError } from '@base/utils/request/error'
import { HttpService } from '@base/utils/request'
import { transformResponseInterceptor, validateBusinessResponseInterceptor } from '@base/utils/request/preset-interceptor'
import { cookies } from 'next/headers'

const http = new HttpService()

http.addRequestInterceptors({
  fulfilled: async (config) => {
    const cookieStore = await cookies()
    config.headers['x-customer-id'] = cookieStore.get('x-customer-id')?.value
    return config
  },
})

// 网络异常（http 状态码不为 2xx）
http.addResponseInterceptors({
  rejected: (error: RequestError) => {
    if (error.status === 401) {
      throw error
    }
    throw error
  },
})

// 业务异常 （http 状态码为 2xx，但业务状态码不是成功状态）
http.addResponseInterceptors({
  fulfilled: validateBusinessResponseInterceptor,
})

http.addResponseInterceptors({
  fulfilled: transformResponseInterceptor,
})

export { http as httpServer }
