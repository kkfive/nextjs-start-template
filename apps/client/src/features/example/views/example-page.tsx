import { ExampleCard } from '../components/example-card'
import { fetchExamplePing } from '../model/calls'

// feature 页面视图：SSR 直取首屏数据，组合 model 与 components。
export async function ExamplePageView() {
  let initialData = null
  try {
    initialData = await fetchExamplePing()
  }
  catch {
    // SSR 取数失败交给组件显示占位，不阻塞整页渲染
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Example</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        最简示例：feature（本目录）→ contracts → apps/api → service RPC 实例的完整链路。
      </p>
      <div className="mt-6">
        <ExampleCard initialData={initialData} />
      </div>
    </section>
  )
}
