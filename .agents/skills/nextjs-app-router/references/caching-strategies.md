# 缓存与重新验证策略

App Router 的缓存控制集中在 `fetch` 选项与 `revalidate*` API 上。

## 读端：fetch 缓存选项

```ts
// 不缓存（每次新鲜）
fetch(url, { cache: 'no-store' })

// 永久缓存（构建期或首次后静态化）
fetch(url, { cache: 'force-cache' })

// ISR：60 秒后重新验证
fetch(url, { next: { revalidate: 60 } })

// 标签缓存：可被 revalidateTag 失效
fetch(url, { next: { tags: ['material:list'] } })
```

## 写端：失效缓存

```ts
'use server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function updateMaterial(id: string, data: Patch) {
  await Material.update(httpClient, id, data)
  // 选其一或组合
  revalidateTag('material:list')              // 同 tag 的所有 fetch 失效
  revalidateTag(`material:detail:${id}`)
  revalidatePath('/material')                 // 按路径失效
  revalidatePath('/material/[id]', 'page')    // 含动态段
}
```

## 路由段配置

```ts
// app/material/page.tsx
export const dynamic = 'force-dynamic'   // 强制每次动态
export const revalidate = 3600           // 整页 ISR 间隔
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'          // 或 'edge'
```

## 决策

| 场景 | 选择 |
|---|---|
| 数据频繁变化、需立即可见 | `cache: 'no-store'` |
| 数据稳定、变更可控 | `tags` + Server Action `revalidateTag` |
| 数据周期变化（如 1 小时） | `next.revalidate` |
| 一次构建终生不变 | `cache: 'force-cache'`（默认） |

## 反例

- ❌ 用 `setInterval` 客户端轮询替代缓存失效
- ❌ Server Action 改了数据库但忘记 `revalidate*`，页面仍是旧值
- ❌ 在 Client Component 里手动写 `fetch(url, { next: { tags } })` —— next 缓存仅在 Server 生效

故障排查见 `gotchas.md`。
