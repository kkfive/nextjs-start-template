import type { HttpResponseError } from '@/lib/request/type'
import { httpServer } from '@/service/index.server'
import { to } from '@base/utils'
import { Controller } from '@domain/example/request/controller'

export default async function Page() {
  // 当请求错误时，返回的是 RequestError 对象
  const [error1, _1] = await to<any, HttpResponseError>(Controller.getError400Data(httpServer))

  return (
    <div>
      <div>
        <p className="text-gray-500">{JSON.stringify(error1)}</p>
      </div>
    </div>
  )
}
