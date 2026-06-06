# 新增 API Route Handler

Route Handler 用 Web 标准 `Request` / `Response`，按 HTTP 方法命名导出函数。

## 步骤

1. **创建 `route.ts`**：路径 `src/app/api/<resource>/route.ts`
2. **按方法导出**：`GET` / `POST` / `PATCH` / `DELETE` 等
3. **校验输入**：用 Zod 校验 query 与 body
4. **统一错误响应**：使用项目 `ApiError`，返回标准状态码
5. **决定缓存**：默认动态；只有读端且数据稳定才加缓存

## 模板

```ts
// src/app/api/materials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { httpClient } from '@/service/index.client'
import { Controller as Material } from '@/domain/material'

const listQuerySchema = z.object({
  keyword: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
})

export async function GET(request: NextRequest) {
  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  )
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_query' }, { status: 400 })
  }
  const data = await Material.getList(httpClient, parsed.data)
  return NextResponse.json(data)
}
```

## 检查

- [ ] 输入用 Zod 校验，错误返回 400
- [ ] 业务通过 Domain Controller，不直接拼 SQL/拼 URL
- [ ] HTTP 实例通过依赖注入传入
- [ ] 返回正确状态码（200/201/400/401/404/500）
- [ ] 决定是否需要 `export const runtime = 'edge'`

## Edge vs Node

| 选择 | 何时 |
|---|---|
| Node (默认) | 需要 Node API、文件系统、加密库、长连接 |
| Edge | 简单读端、CDN 边缘加速、低冷启动 |

缓存与重新验证策略见 `references/caching-strategies.md`。
