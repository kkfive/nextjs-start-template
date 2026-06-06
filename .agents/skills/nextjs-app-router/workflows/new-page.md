# 新增页面 / 布局 / loading / error

App Router 通过文件名约定声明路由元素。本流程覆盖单页面 + 布局 + 加载 + 错误边界的标准结构。

## 步骤

1. **确定路径**：在 `src/app/` 下创建目录，目录名即 URL 段
2. **创建 `page.tsx`**：默认 Server Component；只有交互需求才加 `'use client'`
3. **决定是否需要 `layout.tsx`**：仅当该子树有共享 UI 时；否则不要建（每层 layout 增加渲染树深度）
4. **为慢数据加 `loading.tsx`**：等价于在 `page.tsx` 外包 `<Suspense>`
5. **为有失败可能的页面加 `error.tsx`**：Client Component，必须 `'use client'`
6. **写 Metadata**：静态用 `export const metadata`，动态用 `generateMetadata`（见 `references/metadata.md`）

## 模板

```tsx
// app/products/[id]/page.tsx
import { Suspense } from 'react'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  return (
    <main>
      <ProductHeader product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={id} />
      </Suspense>
    </main>
  )
}
```

```tsx
// app/products/[id]/loading.tsx
export default function Loading() {
  return <ProductSkeleton />
}
```

```tsx
// app/products/[id]/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  )
}
```

## 检查

- [ ] `params` / `searchParams` 已 `await`（Next 15+ 要求 Promise 形态）
- [ ] 数据获取尽量留在 Server Component，向下传 props
- [ ] 业务逻辑通过 Domain Controller 调用，不在页面里 `fetch`
- [ ] UI 组件来自 `@/components/ui/*`
- [ ] 有失败可能的子树有 `error.tsx`

更深的文件约定查 `references/file-conventions.md`。
