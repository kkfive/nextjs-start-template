# @kkfive/biz

前端业务包：基于 Hono RPC（`hc<AppType>`）的端到端类型安全业务 hooks，按垂直业务组织。

## 作用
- **hc RPC hooks**：用 `hono/client` 的 `hc<AppType>` 调 apps/api，后端改字段前端立即 TS 报错
- **垂直业务内聚**：每个业务目录（`example-hitokoto` / `example-request`）内聚该业务的 hooks
- **envelope 解析**：`unwrapData` 解析 api 的 `HttpResponse` envelope，失败抛 `BusinessError`

## 红线
- 依赖 `@kkfive/contracts`(type) / `@kkfive/http-client`(peer) / `api`(type-only AppType) / `hono`
- 含 React（peer），前端专用包，不进服务端
- hc 类型链依赖 apps/api 的 `AppType`（type-only）+ **api routes 必须链式声明**（`new Hono().get().post()`），否则 `typeof` 不含路由 Schema，hc 推导失败

## 消费方式
```ts
import { createBizClient, useHitokotoData } from '@kkfive/biz'

const client = createBizClient(apiBaseUrl)   // app 注入 baseUrl
const { data } = useHitokotoData(client)     // 类型安全的 RPC hook
```

各 app 创建 hc client（注入 baseUrl），传给 biz hooks。SSE 等流式不经 hc（走 `@kkfive/http-client` 的 `.sse()`）。
