# 新增 API Route Handler

Route Handler 语法（`Request`/`Response`、按 HTTP 方法导出）为框架通识，此处只列项目约束。

## 项目约束

- 路径 `apps/{app}/src/app/api/<resource>/route.ts`；**仅轻量 BFF**——核心后端 API 在 `apps/api`（Hono）
- 输入用 `@kkfive/contracts` 的 Zod schema 校验，失败返回 400
- 业务调用留在所属 feature；需要 Hono 后端时由 feature 的 server call 使用 `@/service/rpc-server`
- Route Handler 不直接拼接外部 URL，也不把 calls 下沉到 `packages/rpc`
- 默认动态；仅读端且数据稳定才加缓存（见 `references/caching-strategies.md`）

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

- [ ] 输入用 contracts schema 校验，错误返回 400
- [ ] 业务调用在 feature；BFF 不含核心后端逻辑
- [ ] 返回正确状态码（200/201/400/401/404/500）
