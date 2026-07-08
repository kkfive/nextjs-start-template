# 新建 Domain 模块

Domain 模块分两层：核心逻辑在 `@kkfive/domain-core` 共享包，运行环境适配在各 app 的 `domain/`。

## 步骤

### 1. 在共享包新建模块

1. **选模块名**：小写单数（`material`、`auth`、`user`）
2. **创建目录** `packages/domain-core/src/<module>/`
3. **按需新增文件**（不是所有文件都要立刻有，按真实职责出现再加，见 `references/file-structure.md`）：
   - `const/api.ts` — API 端点与 Query Keys
   - `type.ts` — 业务类型（从 `@kkfive/contracts` 扩展）
   - `service.ts` — 原始请求（注入 `http: HttpService`）
   - `controller.ts` — 业务编排（命名函数导出）
   - `index.ts` — 统一导出
4. **写最小可用切片**：通常先 `getList` + `getDetail`，验证全链路通畅再扩展
5. **统一入口导出**：
   ```ts
   export * from './const/api'
   export { materialService } from './service'
   export { materialController } from './controller'
   export type * from './type'
   ```

### 2. 在各 app 新建适配层

1. **创建目录** `apps/<app>/domain/<module>/`
2. **写 `index.ts`** re-export 共享包 + 可选 hooks：
   ```ts
   // apps/client/domain/material/index.ts
   export * from '@kkfive/domain-core/material'
   export { useMaterialList } from './hooks'   // Next.js apps 专属
   ```
3. **Next.js apps 按需加 `hooks.ts`**（封装 React Query，内部注入该 app 的 HttpService 实例）
4. **`apps/api` 只 re-export，不加 hooks**（路由同进程直调 Controller）

## 调用方

- Next.js Server Component / Server Action：`import { materialController } from '@kkfive/domain-core/material'` + 注入该 app 的服务端实例
- Next.js Client Component：通过该 app 适配层的 `useMaterialList()`
- `apps/api` 路由：`import { materialController } from '@kkfive/domain-core/material'`，同进程直调

## 检查

- [ ] 模块名小写单数
- [ ] 共享包 Service 全部方法第一个参数是 `http: HttpService`
- [ ] 共享包 Controller 用命名函数导出
- [ ] 共享包不 import React / Next / Hono / `@/service/*` / `@/lib/*`
- [ ] 适配层只 re-export + 注入实例 + 可选 hooks，不重写核心逻辑
- [ ] Next.js app 的 hooks 内部注入该 app 的 HttpService 实例
- [ ] 类型用 `type` 不用 `interface`
- [ ] 不在共享包或适配层 import `@/components/*`、`@/hooks/*`、`@/app/*`

详细文件细节见 `references/file-structure.md` 与 `references/examples.md`。
