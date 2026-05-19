import { Controller } from '@domain/example/hitokoto'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { HitokotoCard } from '@/components/domain/hitokoto/hitokoto-card'
import { httpTo } from '@/lib/utils'
import { http } from '@/service/index.base'

export default async function HitokotoPage() {
  const [error, result] = await httpTo(Controller.getData(http))

  return (
    <DemoWrapper>
      <div className="mx-auto max-w-2xl">
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <svg className="size-6 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h3 className="text-base font-semibold text-destructive">请求失败</h3>
            <p className="mt-1 text-sm text-destructive/70">{error.message}</p>
          </div>
        )}
        {result && <HitokotoCard initialData={result} />}
      </div>
    </DemoWrapper>
  )
}
