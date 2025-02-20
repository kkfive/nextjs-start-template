import { http } from '@/service/index.base'
import { httpTo } from '@base/utils'
import HitokotoClientCard from '@domain/example/hitokoto/components/hitokoto-card/index'
import { Controller } from '@domain/example/hitokoto/controller'

export default async function Page() {
  const [error, result] = await httpTo(Controller.getData(http))

  return (
    <div className="mx-auto mt-12 max-w-screen-sm overflow-hidden text-center">
      {error && <div className="text-red-500">{error.message}</div>}
      {result && <HitokotoClientCard initialData={result} />}
    </div>
  )
}
