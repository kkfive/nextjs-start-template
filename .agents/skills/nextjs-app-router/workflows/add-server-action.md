# 新增 Server Action

Server Action 是从 Client 调用的安全 Server 函数。本流程覆盖创建 → 校验 → 失效缓存 → 客户端调用。

## 步骤

1. **创建 action 文件**：顶部 `'use server'`，文件常放在 `src/app/actions/<domain>.ts`
2. **校验输入**：用 Zod 校验，失败返回 `{ error }` 而非 throw
3. **业务调用**：通过 Domain Controller，HTTP 实例从 `httpClient` 注入
4. **失效缓存**：变更后 `revalidateTag` 或 `revalidatePath`
5. **重定向**：仅在 Server Action 中可调用 `redirect()`
6. **客户端绑定**：作为 props 传给 Client Component，或绑到 form 的 `action`

## 模板

```ts
// src/app/actions/material.ts
'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { httpClient } from '@/service/index.client'
import { Controller as Material } from '@/domain/material'

const createSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(['image', 'video']),
})

export async function createMaterial(formData: FormData) {
  const parsed = createSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'invalid_input' as const }
  }
  const created = await Material.create(httpClient, parsed.data)
  revalidateTag('material:list')
  redirect(`/material/${created.id}`)
}
```

```tsx
// app/material/new/page.tsx
import { createMaterial } from '@/app/actions/material'

export default function NewMaterialPage() {
  return (
    <form action={createMaterial}>
      <input name="name" />
      <select name="kind">
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
      <button type="submit">创建</button>
    </form>
  )
}
```

## 检查

- [ ] 文件顶部有 `'use server'`
- [ ] 不抛错给客户端（返回 `{ error }`）；致命错误才 throw
- [ ] 业务通过 Domain Controller，不直接拼 URL
- [ ] 变更后显式 `revalidateTag` / `revalidatePath`
- [ ] Action 不闭包敏感变量（参数都来自 `formData`）

详见 `references/caching-strategies.md` 中的失效模式。
