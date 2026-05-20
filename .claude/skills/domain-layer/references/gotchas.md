# Gotchas

## 依赖注入

- **`http` 漏在第一参** → 长期参数表混乱、与其他模块不一致。养成"先写 `http: HttpService,`"再写其他参
- **hooks 忘记注入 `httpClient`** → 测试时拿不到 mock；改为在 hooks 内 `import { httpClient } from '@/service/index.client'` 并传入
- **Service 内部 `import { http } from '@/service'`** → 锁死环境（Server vs Client），无法适配；用 DI

## 类型与导出

- **`export type * from './type'` 不被 IDE 提示** → TS 5+ 才支持的语法；老 TS 用 `export type { ... }` 列举
- **入口写成 `export * from './controller'`** → 调用方 `import { getList }` 与其他模块冲突；用 `export * as Controller`
- **`interface` 与 `type` 混用** → 项目统一 `type`；`interface` 仅在需要声明合并时

## 循环依赖

- **Controller 引用 hooks** → hooks 是 Client 适配层，不能被 Domain 核心引用；倒置依赖
- **type 跨模块循环引用** → 把共享类型抽到 `domain/<shared>/type.ts` 或 `src/lib/types`

## React Query

- **`queryKey` 漏 query** → `MATERIAL_QUERY_KEYS.list(query)` 必须把 query 序列化进 key，否则换关键词不刷新
- **`mutationFn` 直接调 `service.create`** → 应调 Controller，否则失去字段转换/校验
- **失效缓存写错 key** → 用 `MATERIAL_QUERY_KEYS.list()` 而非裸字符串

## 测试

- **测 Service 走真网络** → 必须传 mock http
- **测 Controller 时 mock Service 不可控** → mock 在更低层（mock http），让 Controller + Service 集成跑

## 命名

- **模块名复数（`materials`）** → 用单数 `material`，符合"一个模块代表一类资源的能力"
- **方法名是名词** → 用动词：`getList` 而非 `list`，`create` 而非 `newItem`
