# 新建 Domain 模块

## 步骤

1. **选模块名**：小写单数（`material`、`auth`、`user`）
2. **创建目录** `domain/<module>/`
3. **按需新增文件**（不是所有文件都要立刻有，按真实职责出现再加，见 `references/file-structure.md`）：
   - `const/api.ts` — API 端点与 Query Keys
   - `type.ts` — 业务类型
   - `service.ts` — 原始请求（注入 `http: HttpService`）
   - `controller.ts` — 业务编排（命名函数导出）
   - `hooks.ts` — React Query 封装（注入 `httpClient`）
   - `index.ts` — 统一导出
4. **写最小可用切片**：通常先 `getList` + `getDetail`，验证全链路通畅再扩展
5. **统一入口导出**：
   ```ts
   export * as Controller from './controller'
   export type * from './type'
   export * from './const/api'
   ```

## 调用方

- Server Component / Server Action：`import { Controller as Material } from '@/domain/material'` + `httpClient`
- Client Component：通过 `domain/material/hooks` 暴露的 `useMaterialList()`

## 检查

- [ ] 模块名小写单数
- [ ] Service 全部方法第一个参数是 `http: HttpService`
- [ ] Controller 用命名函数导出，入口用 `export * as Controller`
- [ ] hooks 内部注入 `httpClient`，不让外层传 http
- [ ] 类型用 `type` 不用 `interface`
- [ ] 不在 Domain 内导入 `@/components/*`、`@/hooks/*`、`@/app/*`

详细文件细节见 `references/file-structure.md` 与 `references/examples.md`。
