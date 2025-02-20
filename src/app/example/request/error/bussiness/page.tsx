import { httpServer } from '@/service/index.server'
import { httpTo } from '@base/utils'
import { Controller } from '@domain/example/request/controller'

export default async function Page() {
  // 当请求错误时，返回的是 RequestError 对象
  const [error1, result] = await httpTo(Controller.getErrorBusinessData(httpServer))

  return (
    <div>
      <div>
        data:
        {' '}
        {JSON.stringify(result)}
      </div>
      <div>
        <p>
          { error1?.code}
        </p>
        <p className="text-gray-500">{JSON.stringify(error1?.message)}</p>
        <p>{JSON.stringify(error1)}</p>
      </div>
    </div>
  )
}
