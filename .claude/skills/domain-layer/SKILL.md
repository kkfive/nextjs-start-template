---
name: domain-layer
description: Domain 层架构规范 - 依赖注入、Service/Controller/Hooks 分层、类型定义、命名规范。用于创建新 Domain 模块、编写 Service/Controller/Hooks、理解数据流。
user-invocable: true
---

# Domain Layer

## S - Scope
- Target: Domain 层代码（`domain/` 目录）
- Cover: 依赖注入、Service/Controller/Hooks 分层、类型定义、命名规范、文件组织
- Avoid: UI 组件、路由、样式（这些属于其他层）

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
依赖注入 | HttpService 参数传递规范 | `references/dependency-injection.md`
文件结构 | 模块文件组织和渐进式扩展 | `references/file-structure.md`
命名规范 | 类型、方法、常量命名规则 | `references/naming-conventions.md`
Hooks 层 | React Query 封装规范 | `references/hooks-layer.md`
完整示例 | Auth/Material 模块示例 | `references/examples.md`

## P - Process
1. **确定模块名称**：使用小写单数形式（如 `material`、`auth`）
2. **创建文件结构**：
   - `const/api.ts` - API 常量和 Query Keys
   - `type.d.ts` - 类型定义
   - `service.ts` - 纯数据获取
   - `controller.ts` - 数据转换 + 业务编排
   - `hooks.ts` - React Query 封装
   - `index.ts` - 统一导出
3. **实现依赖注入**：`http: HttpService` 始终作为第一个参数
4. **编写 Hooks**：内部注入 `httpClient`，统一错误处理

## O - Output
- 符合依赖注入规范的 Service/Controller
- 类型安全的 Hooks
- 统一的导出接口
- 验证清单：依赖注入、类型定义、命名规范

## 核心规范

### 依赖注入（最重要）

```typescript
// ✅ 正确：http 始终作为第一个参数
getList: async (http: HttpService, query?: ListQuery) => { ... }
getDetail: async (http: HttpService, id: string) => { ... }
create: async (http: HttpService, data: CreateRequest) => { ... }

// ❌ 错误：http 不是第一个参数
getList: async (query?: ListQuery, http: HttpService) => { ... }

// ❌ 错误：直接 import 全局实例
import { http } from '@/service/index.base'
export const service = {
  getList: async () => http.get('/api/list') // 无法适配不同环境
}
```

### 文件职责

| 文件 | 职责 | 导出 |
|------|------|------|
| `const/api.ts` | API 端点 + Query Keys | `{MODULE}_API`, `{MODULE}_QUERY_KEYS` |
| `type.d.ts` | 类型定义 | **不导出**（全局声明，直接使用 `{Module}.xxx`） |
| `service.ts` | 纯数据获取 | `{module}Service` |
| `controller.ts` | 数据转换 + 业务编排 | `{module}Controller` |
| `hooks.ts` | React Query 封装 | `use{Module}{Action}` |
| `index.ts` | 统一导出 | 除 type.d.ts 外的所有公共 API |

### 类型定义

```typescript
// domain/{module}/type.d.ts
declare namespace Material {
  // 响应类型
  type ListResponse = { items: Item[], total: number }
  type Item = { id: string, name: string }

  // 请求类型
  type CreateRequest = { name: string }
  type ListQuery = { page?: number, keyword?: string }
}
```

### Hooks 层

```typescript
// domain/{module}/hooks.ts
import { httpClient } from '@/service/index.client' // Client 环境专用

export function useMaterialList(query?: Material.ListQuery) {
  return useQuery({
    queryKey: MATERIAL_QUERY_KEYS.list(query),
    queryFn: () => materialController.getList(httpClient, query), // 注入 httpClient
  })
}
```

## 反模式

| ❌ 不要 | ✅ 应该 | 原因 |
|---------|---------|------|
| `import { http } from '@/service'` | `(http: HttpService) => {}` | 依赖注入支持多环境 |
| `interface Type {}` | `type Type = {}` | 项目规范优先 type |
| `export class Controller` | `export const controller = {}` | 对象导出更简洁 |
| `http` 作为最后一个参数 | `http` 作为第一个参数 | 形成肌肉记忆 |

## 相关 Skills

- /coding-standards: TypeScript 和 React 编码规范
- /project-architecture: 项目架构和目录规范
