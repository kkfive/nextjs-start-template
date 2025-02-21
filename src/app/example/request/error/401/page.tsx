import { httpTo } from '@/lib/utils'
import { httpServer } from '@/service/index.server'
import { Controller } from '@domain/example/request/controller'

export default async function Page() {
  // 当请求错误时，返回的是 RequestError 对象
  const [error1, _1] = await httpTo(Controller.getError401Data(httpServer))
  return (
    <div>
      <div>
        <p>{error1?.name}</p>
        <p className="text-gray-500">{JSON.stringify(error1?.message)}</p>
        <p>{JSON.stringify(_1)}</p>
      </div>
    </div>
  )
}
