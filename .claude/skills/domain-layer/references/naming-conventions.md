# 命名规范

## 类型命名

### 简化方案（推荐，大部分场景）

当 API 返回格式已符合前端需求时，不需要区分 API 类型和业务模型：

```typescript
declare namespace Material {
  // 响应类型：{操作}Response
  type ListResponse = { items: Item[], total: number }
  type DetailResponse = { id: string, name: string, content: string }
  type CreateResponse = { id: string }
  type UpdateResponse = { id: string, updatedAt: string }
  type DeleteResponse = { success: boolean }

  // 实体类型：{实体}
  type Item = { id: string, name: string }

  // 请求类型：{操作}Request
  type CreateRequest = { name: string }
  type UpdateRequest = { name?: string }

  // 查询类型：{操作}Query
  type ListQuery = { page?: number, keyword?: string }
}
```

### 完整方案（需要数据转换时）

当需要数据转换时，区分 API 类型和业务模型：

```typescript
declare namespace Material {
  // API 原始类型：Api{操作}Response
  type ApiListResponse = { items: ApiItem[], total: number, page_size: number }
  type ApiItem = { id: string, file_name: string, created_at: string }

  // 业务模型类型：{操作}Result
  type ListResult = { items: Item[], total: number, pageSize: number }
  type Item = { id: string, fileName: string, createdAt: Date }
}
```

## 方法命名

### Service 层

```typescript
export const materialService = {
  // 格式: {动词}{实体}
  getList: async (http, query) => {},      // 获取列表
  getDetail: async (http, id) => {},       // 获取详情
  create: async (http, data) => {},        // 创建
  update: async (http, id, data) => {},    // 更新
  delete: async (http, id) => {},          // 删除

  // 特殊查询: {动词}By{条件}
  getByCategory: async (http, category) => {},
  getByDateRange: async (http, start, end) => {},

  // 批量操作: {动词}Batch
  createBatch: async (http, items) => {},
  deleteBatch: async (http, ids) => {},
}
```

### Controller 层

```typescript
export const materialController = {
  // 与 Service 保持一致
  getList: async (http, query) => {},
  getDetail: async (http, id) => {},
  create: async (http, data) => {},
  update: async (http, id, data) => {},
  delete: async (http, id) => {},

  // 业务编排: {动词}{实体}And{动词}{实体}
  createAndNotify: async (http, data) => {},
  updateAndRefresh: async (http, id, data) => {},
}
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

### API 端点

```typescript
// 格式: {MODULE}_API
export const MATERIAL_API = {
  LIST: '/api/materials',
  DETAIL: (id: string) => `/api/materials/${id}`,
  CREATE: '/api/materials',
  UPDATE: (id: string) => `/api/materials/${id}`,
  DELETE: (id: string) => `/api/materials/${id}`,
  BY_CATEGORY: (category: string) => `/api/materials/category/${category}`,
  BATCH_DELETE: '/api/materials/batch',
} as const
```

### Query Keys

```typescript
// 格式: {MODULE}_QUERY_KEYS（函数式）
export const MATERIAL_QUERY_KEYS = {
  all: () => ['material'] as const,
  lists: () => [...MATERIAL_QUERY_KEYS.all(), 'list'] as const,
  list: (query?: Material.ListQuery) => [...MATERIAL_QUERY_KEYS.lists(), query] as const,
  details: () => [...MATERIAL_QUERY_KEYS.all(), 'detail'] as const,
  detail: (id: string) => [...MATERIAL_QUERY_KEYS.details(), id] as const,
  byCategory: (category: string) => [...MATERIAL_QUERY_KEYS.all(), 'category', category] as const,
} as const
```

## 命名规则总结

| 场景 | 格式 | 示例 |
|------|------|------|
| 模块名 | 小写单数 | `material`, `auth`, `user` |
| 命名空间 | PascalCase | `Material`, `Auth`, `User` |
| Service 对象 | camelCase + Service | `materialService`, `authService` |
| Controller 对象 | camelCase + Controller | `materialController`, `authController` |
| API 常量 | UPPER_SNAKE_CASE | `MATERIAL_API`, `AUTH_API` |
| Query Keys | UPPER_SNAKE_CASE | `MATERIAL_QUERY_KEYS` |
| 查询 Hook | use{实体}{操作} | `useMaterialList`, `useMaterialDetail` |
| 变更 Hook | use{操作}{实体} | `useCreateMaterial`, `useDeleteMaterial` |
