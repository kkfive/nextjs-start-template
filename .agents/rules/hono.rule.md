# Hono Rule

`apps/api` 是**扩展后端**（Hono），用于需要 Hono 的场景：类型化 hc RPC（见 `/demo/rpc`）、SSE 流式、需要独立后端服务的鉴权 / 数据持久化 / 业务编排 / 外部 API 代理。**常规请求走 client Route Handler**（`apps/*/src/app/api/**`，见 `next-app.rule.md`），Hono 不是默认后端。业务逻辑在 `src/routes/` 的路由 handler 内闭环，用 `@kkfive/contracts` 的 zod schema 校验入参，在入口 `src/app.ts` 导出 `export type AppType = typeof app` 供前端 `hc<AppType>` 端到端类型推导。

路由层做 HTTP 协议适配与业务编排；复杂业务可在 `src/routes/` 内组织为纯函数辅助（同进程调用，不经 HTTP）。数据库、缓存、第三方 SDK 等基础设施放 `src/lib/`，是 api 专属，不进共享包。中间件（`src/middleware/`）只负责横切关注点（认证、日志、错误处理、CORS），不依赖业务。

错误统一经 `app.onError` 归一化为业务可用的 envelope（复用 `@kkfive/contracts` 的 `ok`/`fail`）。SSE 是 Hono 的扩展能力（client Route Handler 不承担流式），用 `hono/streaming` 的 `c.streamSSE`，帧格式与前端 `@kkfive/http-client` 的流式解析对齐；客户端经 `NEXT_PUBLIC_API_URL` 直连 apps/api 的 SSE 路由。

前端调 apps/api 走 rpc 扩展通道（`createRpcClient` + calls，见 `domain.rule.md`），不经 client Route Handler 转发。
