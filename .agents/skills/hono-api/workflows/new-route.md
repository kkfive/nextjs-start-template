# 新建 Hono 路由端点

Hono 路由负责 HTTP 协议适配：解析请求、校验、调 Controller、格式化响应。业务逻辑在 `@kkfive/domain-core`。

## 步骤

1. **确定资源与路径**：在 `apps/api/src/routes/` 下创建或扩展路由文件（如 `material.ts`）
2. **挂载到 app**：在 `app.ts` 用 `app.route('/materials', materialRoutes)` 注册
3. **校验入参**：用 `@kkfive/contracts` 的 schema 校验 body / query / params
4. **调用 Controller**：同进程直调 `@kkfive/domain-core` 的 Controller（不经过 HttpService）
5. **格式化响应**：返回 `c.json(data)`，错误走统一中间件

## 模板

```ts
// apps/api/src/routes/material.ts
import { Hono } from 'hono'
import { CreateMaterialSchema, ListQuerySchema } from '@kkfive/contracts'
import { materialController } from '@kkfive/domain-core/material'
import { db } from '../lib/db'   // api 专属基础设施

export const materialRoutes = new Hono()

materialRoutes.get('/', async (c) => {
  const parsed = ListQuerySchema.safeParse(c.req.query())
  if (!parsed.success) {
    return c.json({ error: 'invalid_query' }, 400)
  }
  // 同进程直调 Controller，传入 db 或内部 caller（不经过 HttpService）
  const data = await materialController.getList(parsed.data)
  return c.json(data)
})

materialRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = CreateMaterialSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'invalid_body' }, 400)
  }
  const created = await materialController.create(parsed.data)
  return c.json(created, 201)
})
```

```ts
// apps/api/src/app.ts
import { Hono } from 'hono'
import { materialRoutes } from './routes/material'
import { errorHandler } from './middleware/error-handler'
import { logger } from './middleware/logger'

const app = new Hono()
app.use('*', logger)
app.onError(errorHandler)
app.route('/materials', materialRoutes)

export default app
```

## 检查

- [ ] 入参用 `@kkfive/contracts` schema 校验，失败返回 400
- [ ] 业务逻辑在 `@kkfive/domain-core` Controller，路由不写 if/循环/转换
- [ ] **不注入 HttpService**（同进程直调，不经 HTTP）
- [ ] 数据库 / 缓存访问通过 `src/lib/` 基础设施或 Controller 参数
- [ ] 路由已用 `app.route()` 挂载
- [ ] 错误由统一 `app.onError` 处理

详细 schema 校验见 `references/schema-validation.md`，同进程直调模式见 `references/domain-direct-call.md`。
