# 命名规范

## 类型命名

### 简化方案（推荐，大部分场景）

当 API 返回格式已符合前端需求时，不需要区分 API 类型和业务模型：

```typescript
// 响应类型：{操作}Response
export type ListResponse = { items: Item[], total: number }
export type DetailResponse = { id: string, name: string, content: string }
export type CreateResponse = { id: string }
export type UpdateResponse = { id: string, updatedAt: string }
export type DeleteResponse = { success: boolean }

// 实体类型：{实体}
export type Item = { id: string, name: string }

// 请求类型：{操作}Request
export type CreateRequest = { name: string }
export type UpdateRequest = { name?: string }

// 查询类型：{操作}Query
export type ListQuery = { page?: number, keyword?: string }
```

### 完整方案（需要数据转换时）

当需要数据转换时，区分 API 类型和业务模型：

```typescript
// API 原始类型：Api{操作}Response
export type ApiListResponse = { items: ApiItem[], total: number, page_size: number }
export type ApiItem = { id: string, file_name: string, created_at: string }

// 业务模型类型：{操作}Result
export type ListResult = { items: Item[], total: number, pageSize: number }
export type Item = { id: string, fileName: string, createdAt: Date }
```

## 方法命名

### Service 层

Service 是命名函数聚合而成的 `service` 对象（对象名固定为 `service`，无模块前缀）：

```typescript
// packages/domain-core/src/material/service.ts
export const service = {
  // 格式: {动词}{实体}
  getList: async (http, query) => {},      // 获取列表
  getDetail: async (http, id) => {},       // 获取详情
  create: async (http, data) => {},        // 创建
  update: async (http, id, data) => {},    // 更新
  delete: async (http, id) => {},          // 删除（对象属性可用保留字）

  // 特殊查询: {动词}By{条件}
  getByCategory: async (http, category) => {},
  getByDateRange: async (http, start, end) => {},

  // 批量操作: {动词}Batch
  createBatch: async (http, items) => {},
  deleteBatch: async (http, ids) => {},
}
```

### Controller 层

Controller 是 `controller.ts` 中的命名导出函数，由 `index.ts` 聚合为 `Controller` 命名空间（`export * as Controller`）。命名函数位置不能用保留字 `delete`，故删除操作写作 `remove`：

```typescript
// packages/domain-core/src/material/controller.ts
export async function getList(http, query) {}        // 与 Service 一致
export async function getDetail(http, id) => {}
export async function create(http, data) => {}
export async function update(http, id, data) => {}
export async function remove(http, id) => {}          // 删除

// 业务编排: {动词}{实体}And{动词}{实体}
export async function createAndNotify(http, data) => {}
export async function updateAndRefresh(http, id, data) => {}
```

### Hooks 层

```typescript
// 查询 Hook: use{实体}{操作}
export function useMaterialList(query, options)
export function useMaterialDetail(id, options) {}
export function useMaterialByCategory(category, options) {}

// 变更 Hook: use{操作}{实体}
export function useCreateMaterial(options) {}
export function useUpdateMaterial(options) {}
export function useDeleteMaterial(options) {}
export function useDeleteMaterialBatch(options) {}
```

## 常量命名

### API 端点配置

每操作一个独立对象，命名为方法名（无集中 `{MODULE}_API`）：

```typescript
// packages/domain-core/src/material/const/api.ts
export const getList = { url: '/api/materials', method: 'GET' as const }
export const getDetail = { url: (id: string) => `/api/materials/${id}`, method: 'GET' as const }
export const create = { url: '/api/materials', method: 'POST' as const }
export const update = { url: (id: string) => `/api/materials/${id}`, method: 'PATCH' as const }
export const remove = { url: (id: string) => `/api/materials/${id}`, method: 'DELETE' as const }
export const getByCategory = { url: (category: string) => `/api/materials/category/${category}`, method: 'GET' as const }
export const deleteBatch = { url: '/api/materials/batch', method: 'DELETE' as const }
```

### Query Keys（适配层内联）

共享包框架无关，禁含 react-query；Query Keys 内联在各 Next.js app 适配层的 `hooks.ts`，命名为 `QUERY_KEYS`：

```typescript
// apps/client/domain/material/hooks.ts
const QUERY_KEYS = {
  all: ['material'] as const,
  list: (query?: Material.ListQuery) => [...QUERY_KEYS.all, 'list', query] as const,
  detail: (id: string) => [...QUERY_KEYS.all, 'detail', id] as const,
  byCategory: (category: string) => [...QUERY_KEYS.all, 'category', category] as const,
}
```

## 命名规则总结

| 场景 | 格式 | 示例 |
|------|------|------|
| 模块名 | 小写单数 | `material`, `auth`, `user` |
| 命名空间 | PascalCase | `Material`, `Auth`, `User` |
| Service 对象 | 固定名 `service`（无模块前缀） | `service.getList` |
| Controller | 命名空间（`export * as Controller`） | `Controller.getList` |
| API 端点配置 | 每操作一个对象，命名为方法名 | `getList = { url, method }` |
| Query Keys | 适配层 hooks 内联（`const QUERY_KEYS`） | `QUERY_KEYS.list(query)` |
| 查询 Hook | use{实体}{操作} | `useMaterialList`, `useMaterialDetail` |
| 变更 Hook | use{操作}{实体} | `useCreateMaterial`, `useDeleteMaterial` |
