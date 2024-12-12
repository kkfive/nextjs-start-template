import { httpBase } from '@/service/index.base'
import { to } from '@base/utils/promise'
import HitokotoClientCard from '@domain/example/hitokoto/components/client-card/index'
import { getData } from '@domain/hitokoto/service'

export default async function Page() {
  const [error, result] = await to(getData(httpBase))

  return (
    <div className="mx-auto mt-12 max-w-screen-sm overflow-hidden text-center">
      {error && <div className="text-red-500">{error.message}</div>}
      {result && <HitokotoClientCard initialData={result} />}
    </div>
  )
}
