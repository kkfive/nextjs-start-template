# Domain Layer Skill

Domain 层架构规范 - `@kkfive/domain-core` 共享纯逻辑 + 各 app 的 Domain 适配层、依赖注入、Service/Controller 分层、React Query 适配。

## 使用场景

- 新建 Domain 模块（在共享包写纯逻辑 + 在 app 写适配层）
- 编写 Service/Controller/Hooks
- 理解共享包与适配层的边界
- 解决依赖注入与跨包引用问题

## 调用方式

```
/domain-layer
```

## 两层结构

```
packages/domain-core/src/{module}/    业务纯逻辑（框架无关）
  ├── service.ts        原始请求（注入 HttpService）
  ├── controller.ts     业务编排
  ├── type.ts           类型（从 @kkfive/contracts 扩展）
  ├── const/api.ts      API 端点 + Query Keys
  └── index.ts          模块公开入口

apps/{app}/domain/{module}/           Domain 适配层
  ├── index.ts          re-export @kkfive/domain-core + 注入实例 + 可选 hooks
  └── hooks.ts          Next.js apps 专属：React Query 包装
```

## 核心规范

### 依赖注入

`http: HttpService` 始终作为共享包 Service/Controller 的第一个参数：

```typescript
// packages/domain-core/src/material/service.ts
getList: async (http: HttpService, query?: ListQuery) => { ... }
```

### 适配层注入实例

```typescript
// apps/client/domain/material/index.ts
import { createMaterialService } from '@kkfive/domain-core/material'
import { httpClient } from '@/service/index.client'
export const materialService = createMaterialService(httpClient)
```

### Hooks 层（Next.js apps 专属）

内部注入该 app 的 HttpService 实例：

```typescript
// apps/client/domain/material/hooks.ts
export function useMaterialList() {
  return useQuery({
    queryFn: () => materialController.getList(httpClient),
  })
}
```

## References

- `references/dependency-injection.md` - 依赖注入规范
- `references/file-structure.md` - 共享包与适配层文件结构
- `references/naming-conventions.md` - 命名规范
- `references/hooks-layer.md` - Hooks 层规范
- `references/examples.md` - 完整示例
