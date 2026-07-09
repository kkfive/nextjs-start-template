# 同进程直调 domain-core

`apps/api` 与 `@kkfive/domain-core` 在同一进程，路由**直接调用** Controller，不经过 HttpService。这是与 Next.js apps 的关键区别。

## 为什么不注入 HttpService

- HttpService 抽象的是"通过 HTTP 调用远程服务"
- `apps/api` 本身就是后端，业务逻辑在**同进程**的 `@kkfive/domain-core`
- 直调避免不必要的 HTTP 序列化/反序列化开销

## 直调模式

```ts
// apps/api/src/routes/material.ts
import { materialController } from '@kkfive/domain-core/material'

materialRoutes.get('/', async (c) => {
  // 直接调 Controller，无需传 HttpService
  const data = await materialController.getList()
  return c.json(data)
})
```

## 与 Next.js apps 调用方式的对比

| 场景 | 调用方式 |
|---|---|
| `apps/client`（浏览器） | 注入 `httpClient`，经 HTTP 调 `apps/api` |
| `apps/admin`（SSR） | 注入服务端实例，经 HTTP 调 `apps/api` |
| `apps/api`（同进程） | **直调 Controller，无 HttpService** |

## 数据库 / 基础设施如何进入 Controller

`apps/api` 的 Controller 如果需要数据库访问，有两种方式：

### 方式 1：Controller 接受 db 参数（推荐，保持可测）

```ts
// @kkfive/domain-core/src/material/controller.ts（共享包定义）
export const materialController = {
  getList: async (db: DbClient, query?: ListQuery) => {
    return db.material.findMany({ where: query })
  },
}
```

```ts
// apps/api/src/routes/material.ts
import { materialController } from '@kkfive/domain-core/material'
import { db } from '../lib/db'

materialRoutes.get('/', async (c) => {
  const data = await materialController.getList(db)
  return c.json(data)
})
```

### 方式 2：`apps/api` 的 domain 适配层封装

```ts
// apps/api/domain/material/index.ts
import { materialController } from '@kkfive/domain-core/material'
import { db } from '../../src/lib/db'

export const Material = {
  getList: (query?: ListQuery) => materialController.getList(db, query),
  getDetail: (id: string) => materialController.getDetail(db, id),
}
```

## 反模式

```ts
// ❌ 在 apps/api 注入 HttpService 调自己
import { httpClient } from './lib/http'
const data = await httpClient.get('/api/materials')   // 多余的 HTTP 跳转

// ✅ 同进程直调
import { materialController } from '@kkfive/domain-core/material'
const data = await materialController.getList()
```
