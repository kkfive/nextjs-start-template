# 写 Service（原始请求）

## 模板

```ts
// domain/material/service.ts
import type { HttpService } from '@/lib/http'
import { MATERIAL_API } from './const/api'
import type * as Material from './type'

export const service = {
  getList: async (http: HttpService, query?: Material.ListQuery) =>
    http.get<Material.ListResponse>(MATERIAL_API.list, { params: query }),

  getDetail: async (http: HttpService, id: string) =>
    http.get<Material.Item>(MATERIAL_API.detail(id)),

  create: async (http: HttpService, data: Material.CreateRequest) =>
    http.post<Material.Item>(MATERIAL_API.list, data),

  update: async (http: HttpService, id: string, data: Material.UpdateRequest) =>
    http.patch<Material.Item>(MATERIAL_API.detail(id), data),

  remove: async (http: HttpService, id: string) =>
    http.delete<void>(MATERIAL_API.detail(id)),
}
```

## 硬约束

1. **`http: HttpService` 永远是第一个参数** —— 形成肌肉记忆
2. **Service 只做原始请求**，不做：
   - 业务字段转换（去 Controller）
   - 错误语义翻译（去 Controller）
   - 重试 / 并发控制（去基础设施层）
3. **方法名是动词**：`getList`、`getDetail`、`create`、`update`、`remove`、`batchUpdate`
4. **返回类型显式标注**：`http.get<Material.Item>(...)`，避免推断成 `any`

## 测试

```ts
// domain/material/service.test.ts
import { service } from './service'
import { mockHttp } from '@/test/mock-http'

test('getList passes query as params', async () => {
  const http = mockHttp({ get: vi.fn().mockResolvedValue({ items: [], total: 0 }) })
  await service.getList(http, { keyword: 'logo' })
  expect(http.get).toHaveBeenCalledWith(MATERIAL_API.list, { params: { keyword: 'logo' } })
})
```

由于 `http` 被注入，测试无需 mock 全局，直接传入 mock 实例。

依赖注入背后的原因见 `references/dependency-injection.md`。
