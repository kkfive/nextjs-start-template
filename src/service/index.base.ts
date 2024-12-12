import { HttpService } from '@base/utils/request'
import { transformResponseInterceptor } from '@base/utils/request/preset-interceptor'

const http = new HttpService({
  meta: { isOnlyData: false },
})

http.addResponseInterceptors({
  fulfilled: transformResponseInterceptor,
})

export { http as httpBase }
