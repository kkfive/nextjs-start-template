import HitokotoClientCard from '@domain/example/hitokoto/components/hitokoto-card/index'
import { Controller } from '@domain/example/hitokoto/controller'
import { httpTo } from '@/lib/utils'
import { http } from '@/service/index.base'
import { DemoWrapper } from '../../components/demo-wrapper'

export default async function HitokotoPage() {
  const [error, result] = await httpTo(Controller.getData(http))

  return (
    <DemoWrapper>
      <div className="mx-auto max-w-screen-sm overflow-hidden text-center">
        {error && <div className="text-red-500">{error.message}</div>}
        {result && <HitokotoClientCard initialData={result} />}
      </div>
    </DemoWrapper>
  )
}
