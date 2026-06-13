# Gotchas（高价值踩坑）

## 缓存

- **改数据后页面没刷新**：Server Action 中漏了 `revalidateTag` / `revalidatePath`
- **`fetch` 自动缓存**：Server 端 `fetch` 默认带缓存（旧版默认 force-cache），新版默认动态，但你显式用 `force-cache` 后再改数据库不会刷新 —— 用 `tags` 配 `revalidateTag`
- **客户端 `fetch` 不受 next 缓存**：`next: { tags }` 仅 Server 端生效

## Server / Client 边界

- **传 Map/Set/类实例报错**：Server → Client 必须 JSON 可序列化，见 `rules/data-serialization.md`
- **整页变 Client 只为一个按钮**：拆出最小 Client 子组件
- **`useSearchParams` 必须在 Suspense 内**：否则触发整页 CSR 退化
- **错误："Functions cannot be passed directly to Client Components"**：函数必须是 Server Action（`'use server'`），或不传

## 路由

- **同目录既有 `page.tsx` 又有 `route.ts`**：冲突，Next 报错
- **`params` 没 `await`**：Next 15+ `params` 是 Promise，必须 `await`
- **`<Link>` 之后 `useRouter().refresh()` 仍是旧数据**：缓存层未失效，需结合 `revalidate*`
- **拦截路由不工作**：`(.)` 只拦截同级；跨级用 `(..)foo` / `(...)foo`

## 渲染

- **error.tsx 不工作**：忘记 `'use client'` —— error boundary 必须是 Client
- **layout.tsx 改了不重新渲染**：layout 在导航间持久；要强制重挂载用 `template.tsx`
- **Suspense fallback 一闪而过**：数据已被缓存 —— 这是正常表现

## 性能

- **首屏图慢**：缺 `priority`，或没设 `sizes`
- **Bundle 突然变大**：在 root layout 引入了仅子页面用的库，下沉 import 位置
- **`'use client'` 蔓延**：父组件加了，子树即使是 Server 也按 Client 处理

## SEO

- **OG 图是相对路径**：root layout 没设 `metadataBase`
- **`title` 没继承 template**：子页面写 `metadata: { title: { absolute: 'X' } }` 会跳过 template
