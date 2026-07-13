# 新增 API Route Handler

Route Handler 用 Web 标准 `Request` / `Response`，按 HTTP 方法命名导出函数。

## 步骤

1. **创建 `route.ts`**：路径 `apps/{app}/src/app/api/<resource>/route.ts`（仅轻量 BFF；核心后端 API 在 `apps/api`）
2. **按方法导出**：`GET` / `POST` / `PATCH` / `DELETE` 等
3. **校验输入**：用 `@kkfive/contracts` 的 Zod schema 校验 query 与 body
4. **统一错误响应**：使用项目 `ApiError`，返回标准状态码
5. **决定缓存**：默认动态；只有读端且数据稳定才加缓存

## 模板

```ts
// apps/client/src/app/api/materials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ListQuerySchema } from '@kkfive/contracts'
import { fetchMaterialList } from '@/features/material/model/calls.server'

export async function GET(request: NextRequest) {
  const parsed = ListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  )
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_query' }, { status: 400 })
  }
  const data = await fetchMaterialList(parsed.data)
  return NextResponse.json(data)
}
```

## 检查

- [ ] 输入用 `@kkfive/contracts` schema 校验，错误返回 400
- [ ] 业务调用留在所属 feature；需要 Hono 时由 feature 的 server call 使用 `@/service/rpc-server`
- [ ] Route Handler 不直接拼接外部 URL，也不把 calls 下沉到 `packages/rpc`
- [ ] 返回正确状态码（200/201/400/401/404/500）
- [ ] 决定是否需要 `export const runtime = 'edge'`
- [ ] 核心后端逻辑不在 BFF，而在 `apps/api`（Hono）

## Edge vs Node

| 选择 | 何时 |
|---|---|
| Node (默认) | 需要 Node API、文件系统、加密库、长连接 |
| Edge | 简单读端、CDN 边缘加速、低冷启动 |

缓存与重新验证策略见 `references/caching-strategies.md`。
