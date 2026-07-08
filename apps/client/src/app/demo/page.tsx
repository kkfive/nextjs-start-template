import Link from 'next/link'
import {
  LucideArrowUpRight,
  LucideTrash2,
} from '@/components/ui/icon'
import { demoNavConfig } from '@/config/demo-nav'

export default function DemoIndexPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-12 sm:py-16">
      {/* Hero Section */}
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          功能演示
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          通过交互式示例探索模板的各种功能。每个演示都聚焦于特定特性，展示最佳实践。
        </p>
      </div>

      {/* How to Remove Demos */}
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            <LucideTrash2 className="size-4" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              如何移除演示代码
            </h2>
            <p className="text-sm text-amber-800 dark:text-amber-400/80">
              开始新项目时，可以安全地删除以下目录：
            </p>
            <div className="flex flex-wrap gap-2">
              {['src/app/demo/', 'src/app/api/demo/', 'domain/demo/'].map(path => (
                <code
                  key={path}
                  className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  {path}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Categories */}
      <div className="space-y-12">
        <h2 className="text-xl font-bold tracking-tight">按分类浏览</h2>

        {demoNavConfig.map(category => (
          <div key={category.category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold">{category.category}</h3>
              <span className="ml-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {category.items.length}
              </span>
            </div>

            {/* Category Items */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {item.name}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <LucideArrowUpRight className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:text-primary" />
                  </div>

                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      打开演示
                      <LucideArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
