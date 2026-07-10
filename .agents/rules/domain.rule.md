# Domain Rule

业务逻辑闭环在 `apps/api`（Hono）：路由层用 `@kkfive/contracts` 的 zod schema 校验入参、承担业务编排与外部 API 代理，并在入口导出 `export type AppType = typeof app` 作为前端类型链的源头。

`packages/biz` 是前端业务包，用 `hono/client` 的 `hc<AppType>` 做端到端类型安全调用，按垂直业务组织——每个业务目录内聚 React Query hooks 与业务 UI 组件。HTTP 实例由各 app 注入（biz 的 hc client 经 wrapper 复用 app 的 HttpService interceptor），biz 不硬编码实例或 baseUrl。纯展示、零业务依赖的 dumb 组件留在各 app。

各 app 的 `domain/` 适配层负责注入运行时（baseUrl、HttpService）并 re-export biz 的公共 API，不承载业务逻辑。

类型来自 `@kkfive/contracts`（zod + infer）与 api 的 `AppType`（type-only 跨包导入，不把 Hono 运行时打进浏览器）。外部响应不可信，路由层归一化为业务类型；不为适配外部响应把业务模型字段批量改成 `?:`。

SSE 等流式不走 hc（无流式语义）：客户端直连 api 的 SSE 路由，服务端用 `hono/streaming`。框架无关的纯计算下沉 `@kkfive/utils`（common/dom 物理隔离）。
