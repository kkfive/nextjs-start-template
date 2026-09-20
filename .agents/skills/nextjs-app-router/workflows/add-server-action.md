# 新增 Server Action

Server Action 语法（`'use server'`、form 绑定）为框架通识，此处只列项目约束。

## 项目约束

- 文件放 `apps/{app}/src/app/actions/<domain>.ts`，顶部 `'use server'`
- 输入用 `@kkfive/contracts` Zod schema 校验，失败**返回 `{ error }` 而非 throw**（throw 会穿过边界到客户端）
- 业务调用走所属 feature 的 server call（按需用 `@/service/rpc-server`）；不直接拼 URL，不把 calls 放 `packages/rpc`
- **变更后必须 `revalidateTag` / `revalidatePath`**（tag 约定见 `references/caching-strategies.md`）
- 仅 Server Action 中可调用 `redirect()`；Action 不闭包敏感变量（参数都来自 `formData`）

## 模板

```ts
// apps/client/src/app/actions/material.ts
'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { CreateMaterialSchema } from '@kkfive/contracts'
import { createMaterial } from '@/features/material/model/calls.server'

export async function createMaterialAction(formData: FormData) {
  const parsed = CreateMaterialSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'invalid_input' as const }
  }
  const created = await createMaterial(parsed.data)
  revalidateTag('material:list')
  redirect(`/material/${created.id}`)
}
```

## 检查

- [ ] 顶部 `'use server'`
- [ ] 校验失败返回 `{ error }`，不向客户端 throw
- [ ] 变更后显式失效缓存
