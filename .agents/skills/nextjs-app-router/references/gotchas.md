# Gotchas（高价值踩坑）

## 缓存

- **改数据后页面没刷新**：Server Action 中漏了 `revalidateTag` / `revalidatePath`
- **`fetch` 自动缓存**：Server 端 `fetch` 默认带缓存（旧版默认 force-cache），新版默认动态，但你显式用 `force-cache` 后再改数据库不会刷新 —— 用 `tags` 配 `revalidateTag`
- **客户端 `fetch` 不受 next 缓存**：`next: { tags }` 仅 Server 端生效

## Server / Client 边界

- **传 Map/Set/类实例报错**：Server → Client 必须可序列化；项目约定 RPC calls 返回值在跨边界**前**扁平化为 plain object（DTO），不把含方法的聚合对象传给 Client Component
- **整页变 Client 只为一个按钮**：拆出最小 Client 子组件
- **`useSearchParams` 必须在 Suspense 内**：否则触发整页 CSR 退化
- **错误："Functions cannot be passed directly to Client Components"**：函数必须是 Server Action（`'use server'`），或不传

## 路由

- **`params` 没 `await`**：Next 15+ `params` 是 Promise，必须 `await`
- **`<Link>` 之后 `useRouter().refresh()` 仍是旧数据**：缓存层未失效，需结合 `revalidate*`

## 渲染

- **`'use client'` 蔓延**：父组件加了，子树即使是 Server 也按 Client 处理
- **Bundle 突然变大**：在 root layout 引入了仅子页面用的库，下沉 import 位置
