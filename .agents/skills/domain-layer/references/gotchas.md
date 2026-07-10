# Gotchas

## 共享包 vs 适配层

- **在 `packages/domain-core` 里写 React Query hooks** → 共享包框架无关，禁依赖 React；hooks 写进各 Next.js app 的 `domain/{module}/hooks.ts`
- **在共享包 `const/api.ts` 里定义 `QUERY_KEYS`** → 共享包禁含 react-query；Query Keys 内联在各 app 适配层的 `hooks.ts`（`const QUERY_KEYS`）
- **在 app 的 `domain/` 适配层重写 service/controller** → 核心逻辑应在共享包；适配层只 re-export + 注入实例
- **共享包里 `import { httpClient } from '@/service/...'`** → 共享包不应感知任何 app 内部路径；Service/Controller 只接受注入的 HttpService
- **共享包里 import React / Next / Hono** → 破坏框架无关性；运行环境适配留各 app

## 依赖注入

- **`http` 漏在第一参** → 长期参数表混乱、与其他模块不一致。养成"先写 `http: HttpService,`"再写其他参
- **hooks 忘记注入 `httpClient`** → 测试时拿不到 mock；改为在 hooks 内 `import { httpClient } from '@/service/index.client'` 并传入
- **共享包 Service 内部 `import { http } from '@/service'`** → 锁死某一 app 的环境，无法跨 app 复用；用 DI

## 类型与导出

- **`export type * from './type'` 不被 IDE 提示** → TS 5+ 才支持的语法；老 TS 用 `export type { ... }` 列举
- **入口写成 `export * from './controller'`** → 调用方 `import { getList }` 与其他模块冲突；用 `export * as Controller`
- **`interface` 与 `type` 混用** → 项目统一 `type`；`interface` 仅在需要声明合并时
- **把接口响应字段批量改成 `?:`** → 会污染业务模型，且漏掉 `null`；原始响应用 `ExternalData<T>`，Controller 再归一化
- **Service 直接相信接口必填字段** → 外部响应可能缺字段或为 `null`；不要让原始响应直接流入 UI

## 循环依赖

- **共享包 Controller 引用 app 适配层 hooks** → hooks 是 app 适配层，不能被共享包引用；倒置依赖
- **type 跨模块循环引用** → 把共享类型抽到 `@kkfive/contracts` 或共享包的 `_shared/`

## React Query

- **`queryKey` 漏 query** → `QUERY_KEYS.list(query)` 必须把 query 序列化进 key，否则换关键词不刷新
- **`mutationFn` 直接调 `service.create`** → 应调 Controller，否则失去字段转换/校验
- **失效缓存写错 key** → 失效整个列表族用 `[...QUERY_KEYS.all, 'list']` 前缀，而非裸字符串

## 测试

- **测 Service 走真网络** → 必须传 mock http
- **测 Controller 时 mock Service 不可控** → mock 在更低层（mock http），让 Controller + Service 集成跑

## 命名

- **模块名复数（`materials`）** → 用单数 `material`，符合"一个模块代表一类资源的能力"
- **方法名是名词** → 用动词：`getList` 而非 `list`，`create` 而非 `newItem`
