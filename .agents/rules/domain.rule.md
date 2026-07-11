# Domain Rule

业务逻辑闭环在 `apps/api`（Hono）：路由层用 `@kkfive/contracts` 的 zod schema 校验入参、承担业务编排与外部 API 代理，并在入口导出 `export type AppType = typeof app` 作为前端类型链的源头。

`packages/rpc` 是类型化 RPC 包（`createRpcClient` 工厂 + `unwrapData` + 自有 api 共享 calls），不含 react-query/react——hooks 各 app 自写（缓存策略自治），业务组件留各 app `src/components/`。HTTP 实例由各 app 的 `src/service/` 注入（hc 经 `createRpcClient(http, baseUrl)` 复用实例拦截器），rpc 不硬编码实例或 baseUrl。第三方 calls 默认 app 专属，放 `src/service/`；多 app 共享时才提取进 rpc。

各 app 的 `src/service` 注入 HttpService 实例（浏览器/服务端双实例，由 `server-only`/`client-only` 物理隔离）与 app 专属 calls；hc 经 `createRpcClient` 复用实例拦截器（retry / hooks / 401 / 错误归一化），不承载业务逻辑。

类型来自 `@kkfive/contracts`（zod + infer）与 api 的 `AppType`（type-only 跨包导入，不把 Hono 运行时打进浏览器）。外部响应不可信，路由层归一化为业务类型；不为适配外部响应把业务模型字段批量改成 `?:`。

SSE 等流式不走 hc（无流式语义）：客户端直连 api 的 SSE 路由，服务端用 `hono/streaming`。框架无关的纯计算下沉 `@kkfive/utils`（common/dom 物理隔离）。
