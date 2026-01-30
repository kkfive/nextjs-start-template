import { Controller } from '@domain/example/hitokoto/controller'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { HitokotoCard } from '@/components/domain/hitokoto/hitokoto-card'
import { httpTo } from '@/lib/utils'
import { http } from '@/service/index.base'

export default async function HitokotoPage() {
  const [error, result] = await httpTo(Controller.getData(http))

  return (
    <DemoWrapper>
      <div className="mx-auto max-w-screen-sm overflow-hidden text-center">
        {error && <div className="text-red-500">{error.message}</div>}
        {result && <HitokotoCard initialData={result} />}
      </div>
    </DemoWrapper>
  )
}
