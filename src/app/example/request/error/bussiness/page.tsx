import type { HttpResponseError } from '@base/utils/request/type'
import { httpServer } from '@/service/index.server'
import { to } from '@base/utils/promise'
import { service } from '@domain/example/request/service'

export default async function Page() {
  // 当请求错误时，返回的是 RequestError 对象
  const [error1, _1] = await to<any, HttpResponseError>(service.getErrorBusiness(httpServer))

  return (
    <div>
      <div>
        <p className="text-gray-500">{JSON.stringify(error1?.data)}</p>
      </div>
    </div>
  )
}
