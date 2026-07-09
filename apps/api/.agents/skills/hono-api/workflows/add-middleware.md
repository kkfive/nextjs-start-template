# 新增 Hono 中间件

中间件只负责横切关注点（认证、日志、错误处理、CORS），**不依赖 Domain**。业务逻辑在路由或 Controller。

## 步骤

1. **确定中间件类型**：认证 / 日志 / 错误处理 / CORS / 限流
2. **创建文件**：`apps/api/src/middleware/<name>.ts`
3. **注册顺序**：在 `app.ts` 按顺序 `app.use('*', ...)`；错误处理用 `app.onError`
4. **不引入 Domain 依赖**：中间件不应 import `@kkfive/domain-core` 或 `apps/api/domain/*`

## 模板

### 认证中间件

```ts
// apps/api/src/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../lib/jwt'

export const auth = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return c.json({ error: 'unauthorized' }, 401)
  }
  const payload = await verifyToken(token)
  c.set('user', payload)
  await next()
})
```

### 错误处理

```ts
// apps/api/src/middleware/error-handler.ts
import type { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('[API Error]', err)
  // 项目错误类映射状态码
  if (err.name === 'ValidationError') return c.json({ error: err.message }, 400)
  if (err.name === 'AppError') return c.json({ error: err.message }, 400)
  return c.json({ error: 'internal_error' }, 500)
}
```

### CORS

```ts
// apps/api/src/middleware/cors.ts
import { cors } from 'hono/cors'

// 直接用 Hono 内置 cors 中间件
app.use('*', cors({ origin: ['https://client.example.com'], credentials: true }))
```

## 注册顺序

```ts
// apps/api/src/app.ts
app.use('*', logger)           // 1. 日志最先
app.use('*', cors())           // 2. CORS
app.use('/protected/*', auth)  // 3. 认证（仅保护路由）
app.onError(errorHandler)      // 错误处理单独注册
app.route('/materials', materialRoutes)
```

## 检查

- [ ] 中间件不 import `@kkfive/domain-core` 或 `apps/api/domain/*`
- [ ] 中间件不 import `src/routes/*`
- [ ] 基础设施依赖（JWT、DB）来自 `src/lib/`
- [ ] 注册顺序合理（日志 → CORS → 认证 → 路由）
- [ ] 错误处理用 `app.onError`，不每个路由重复 try/catch
