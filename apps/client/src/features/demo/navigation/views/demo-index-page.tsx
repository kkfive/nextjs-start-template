import { LucideArrowRight } from '@kkfive/ui/components/icon'
import Link from 'next/link'
import { AtmosphereLayer } from '@/components/atmosphere/atmosphere-layer'
import { demoNavConfig } from '../model/nav'

const totalCount = demoNavConfig.reduce((sum, category) => sum + category.items.length, 0)

export default function DemoIndexPage() {
  return (
    <div className="px-4 pb-18 sm:px-6">
      <div className="mx-auto max-w-300">
        <section className="relative overflow-hidden rounded-4xl border border-border/60 bg-canvas/88 px-6 py-10 shadow-soft sm:px-8">
          <AtmosphereLayer intensity="section" gridInset="inset-x-[14%] top-[14%] bottom-[18%]" />
          <div className="relative max-w-3xl">
            <p className="meta-mono text-muted-foreground">
              DEMO INDEX —
              {String(totalCount).padStart(2, '0')}
              {' '}
              EXPERIMENTS
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">以真实页面验证模板的边界、样式与交互。</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">每个演示对应一个真实 feature 模块，覆盖请求、状态、表单、RPC 与主题能力，可在真实页面中逐项验证，验证通过即可复用到业务代码。</p>
          </div>
        </section>

        <div className="mt-10 space-y-10">
          {demoNavConfig.map((category, categoryIndex) => (
            <section key={category.id} className="animate-soft-rise opacity-0" style={{ animationDelay: `${categoryIndex * 60}ms` }}>
              <div className="mb-4 flex items-center gap-3">
                <span aria-hidden className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent [&_svg]:size-4.5">{category.icon}</span>
                <h2 className="text-lg font-semibold tracking-tight">{category.name}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{category.items.length}</span>
                <span aria-hidden className="h-px min-w-6 flex-1 bg-border/60" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item, itemIndex) => {
                  const itemNo = `${categoryIndex + 1}.${itemIndex + 1}`
                  return (
                    <Link key={item.id} href={item.href} className="group relative animate-soft-rise overflow-hidden rounded-2xl border border-border/60 bg-card/75 p-4 opacity-0 shadow-soft-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-soft" style={{ animationDelay: `${categoryIndex * 60 + itemIndex * 40 + 80}ms` }}>
                      <div aria-hidden className="luminous-divider pointer-events-none absolute inset-x-0 top-0 h-px" />
                      <div className="relative min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="meta-mono shrink-0 text-muted-foreground transition-colors group-hover:text-accent">{itemNo}</span>
                          <span className="truncate text-sm font-semibold">{item.name}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="meta-mono text-muted-foreground">{category.name}</span>
                          <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 group-hover:bg-accent group-hover:text-accent-foreground"><LucideArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" /></span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft-sm">
          <p className="meta-mono text-muted-foreground">
            NOTE — 移除
            <code className="font-mono">src/app/demo</code>
            {' '}
            与
            <code className="font-mono">src/features/demo</code>
            {' '}
            即可剥离全部演示代码。
          </p>
        </div>
      </div>
    </div>
  )
}
