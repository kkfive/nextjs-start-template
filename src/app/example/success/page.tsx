import { httpServer } from '@/service/index.server'
import { to } from '@base/utils/promise'
import { service } from '@domain/example/request/service'

export default async function Page() {
  // 一切正常的请求 (默认情况下只获取response.data的数据)
  const [_1, result1] = await to(service.getSuccess(httpServer))

  const [_2, result2] = await to(service.getSuccess(httpServer, { meta: { isTransformResponse: false } }))
  return (
    <div>
      <div>
        默认情况下只返回成功响应体中的 data 字段
        <p className="text-gray-500">{JSON.stringify(result1)}</p>
      </div>

      <div>
        通过设置 meta.isTransformResponse（或isOnlyData）属性控制相响应数据
        <p className="text-gray-500">{JSON.stringify(result2)}</p>
      </div>
    </div>
  )
}
