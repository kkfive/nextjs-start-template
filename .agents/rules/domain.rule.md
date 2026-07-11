# Domain Rule

请求通道分主从：常规请求走 client Route Handler（`apps/*/src/app/api/**`，见 `next-app.rule.md`）；需要 Hono 的场景（类型化 hc RPC、SSE 流式、独立后端服务）走 apps/api 扩展通道（见 `hono.rule.md`）。apps/api 路由层用 `@kkfive/contracts` 的 zod schema 校验入参、承担业务编排与外部 API 代理，并在入口导出 `export type AppType = typeof app` 作为前端类型链的源头。

`packages/rpc` 是类型化 RPC 包（`createRpcClient` 工厂 + `unwrapData` + 自有 api 共享 calls），不含 react-query/react——hooks 各 app 自写（缓存策略自治），业务组件留各 app `src/components/`。HTTP 实例由各 app 的 `src/service/` 注入（hc 经 `createRpcClient(http, baseUrl)` 复用实例拦截器），rpc 不硬编码实例或 baseUrl。第三方 calls 默认 app 专属，放 `src/service/`；多 app 共享时才提取进 rpc。

各 app 的 `src/service` 注入 HttpService 实例（浏览器/服务端双实例，由 `server-only`/`client-only` 物理隔离）与 app 专属 calls；hc 经 `createRpcClient` 复用实例拦截器（retry / hooks / 401 / 错误归一化），不承载业务逻辑。

类型来自 `@kkfive/contracts`（zod + infer）与 api 的 `AppType`（type-only 跨包导入，不把 Hono 运行时打进浏览器）。外部响应不可信，路由层归一化为业务类型；不为适配外部响应把业务模型字段批量改成 `?:`。

call 归位：调 client Route Handler 用 HttpService（`httpClient` / `httpServer`，主通道）；调 apps/api(Hono) 用 rpc（`createRpcClient` + calls，扩展通道）；第三方外部 API 经 apps/api 代理，前端不直连（避免泄露 key / 绕过 CORS）。envelope 解析统一经 `unwrapData`（成功返回 data，`success:false` 抛 `BusinessError`）。

SSE 是 Hono 扩展能力，不走 hc（无流式语义）也不走 Route Handler：客户端经 `NEXT_PUBLIC_API_URL` 直连 apps/api 的 SSE 路由，服务端用 `hono/streaming`。框架无关的纯计算下沉 `@kkfive/utils`（common/dom 物理隔离）。
