# Schema 校验（@kkfive/contracts）

`apps/api` 用 `@kkfive/contracts` 的 zod schema 校验请求入参和响应形状。schema 是跨 app 共享的单一真源——客户端用它做表单验证，服务端用它校验请求。

## 校验请求体

```ts
// apps/api/src/routes/material.ts
import { CreateMaterialSchema } from '@kkfive/contracts'

materialRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = CreateMaterialSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({
      error: 'invalid_body',
      details: parsed.error.issues,
    }, 400)
  }
  // parsed.data 是已校验的类型安全数据
  const created = await materialController.create(parsed.data)
  return c.json(created, 201)
})
```

## 校验 Query 参数

```ts
import { ListQuerySchema } from '@kkfive/contracts'

materialRoutes.get('/', async (c) => {
  // c.req.query() 返回字符串，schema 用 z.coerce 转换
  const parsed = ListQuerySchema.safeParse(c.req.query())
  if (!parsed.success) {
    return c.json({ error: 'invalid_query' }, 400)
  }
  const data = await materialController.getList(parsed.data)
  return c.json(data)
})
```

## 校验路径参数

```ts
materialRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  if (!id) return c.json({ error: 'invalid_id' }, 400)
  const item = await materialController.getDetail(id)
  return c.json(item)
})
```

## Hono 原生校验辅助

Hono 提供 `hono/validator` 与 zod 集成，可让校验更声明式：

```ts
import { zValidator } from '@hono/zod-validator'
import { CreateMaterialSchema } from '@kkfive/contracts'

materialRoutes.post('/', zValidator('json', CreateMaterialSchema), async (c) => {
  const data = c.req.valid('json')   // 已校验的类型安全数据
  const created = await materialController.create(data)
  return c.json(created, 201)
})
```

> 选择手写 `safeParse` 还是 `zValidator` 取决于团队偏好；schema 来源始终是 `@kkfive/contracts`。

## 何时新增 schema

- schema 跨 `apps/api` 和至少一个前端 app 共享 → 放 `@kkfive/contracts/schemas/`
- schema 只在 `apps/api` 内部使用 → 可放 `apps/api/domain/{module}/`，不必进共享包
- 判断标准同 packages 通用性原则：出现第二个消费方再提取

## 反模式

```ts
// ❌ 路由内联定义 schema（重复、漂移）
const createSchema = z.object({ name: z.string() })

// ✅ 从 contracts 导入（单一真源）
import { CreateMaterialSchema } from '@kkfive/contracts'
```
