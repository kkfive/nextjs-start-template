# 写 Service（原始请求）

## 模板

```ts
// packages/domain-core/src/material/service.ts
import type { HttpService } from '@kkfive/http-client'
import {
  getList as getListApi,
  getDetail as getDetailApi,
  create as createApi,
  update as updateApi,
  remove as removeApi,
} from './const/api'
import type * as Material from './type'

async function getList(http: HttpService, query?: Material.ListQuery) {
  const { url, method } = getListApi
  return http.request<Material.RawListResponse>(url, { method, params: query })
}

async function getDetail(http: HttpService, id: string) {
  const { url, method } = getDetailApi
  return http.request<Material.Item>(url(id), { method })
}

async function create(http: HttpService, data: Material.CreateRequest) {
  const { url, method } = createApi
  return http.request<Material.Item>(url, { method, json: data })
}

async function update(http: HttpService, id: string, data: Material.UpdateRequest) {
  const { url, method } = updateApi
  return http.request<Material.Item>(url(id), { method, json: data })
}

async function remove(http: HttpService, id: string) {
  const { url, method } = removeApi
  return http.request<void>(url(id), { method })
}

export const service = { getList, getDetail, create, update, remove }
```

## 硬约束

1. **`http: HttpService` 永远是第一个参数** —— 形成肌肉记忆
2. **Service 只做原始请求**，不做：
   - 业务字段转换（去 Controller）
   - 错误语义翻译（去 Controller）
   - 重试 / 并发控制（去基础设施层）
3. **方法名是动词**：`getList`、`getDetail`、`create`、`update`、`remove`、`batchUpdate`（`delete` 是保留字，命名函数位置用 `remove`）
4. **`service` 对象聚合命名函数**（`export const service = { getList, ... }`），无模块前缀
5. **返回类型显式标注**：`http.request<Material.RawItem>(...)`，避免推断成 `any`
6. **外部响应保持可疑**：原始响应类型用 `ExternalData<T>`，不要把业务模型字段批量改成 `?:`

## 测试

```ts
// packages/domain-core/src/material/service.test.ts
import { getList as getListApi } from './const/api'
import { service } from './service'
import { mockHttp } from '@kkfive/test-utils'   // 共享测试工具（或本包内的 mock helper）

test('getList passes query as params', async () => {
  const http = mockHttp({ request: vi.fn().mockResolvedValue({ items: [], total: 0 }) })
  await service.getList(http, { keyword: 'logo' })
  expect(http.request).toHaveBeenCalledWith(
    getListApi.url,
    expect.objectContaining({ method: 'GET', params: { keyword: 'logo' } }),
  )
})
```

由于 `http` 被注入，测试无需 mock 全局，直接传入 mock 实例。

依赖注入背后的原因见 `references/dependency-injection.md`。
外部响应的空值处理见 `references/external-data.md`。
