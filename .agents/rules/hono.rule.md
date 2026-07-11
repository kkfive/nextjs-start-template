# Hono Rule

`apps/api` 是独立后端服务（Hono），承担鉴权、数据持久化、业务编排、外部 API 代理。业务逻辑闭环在 `src/routes/` 的路由 handler 内，用 `@kkfive/contracts` 的 zod schema 校验入参，在入口 `src/app.ts` 导出 `export type AppType = typeof app` 供前端 `hc<AppType>` 端到端类型推导。

路由层只做 HTTP 协议适配与业务编排；复杂业务可在 `src/routes/` 内组织为纯函数辅助（同进程调用，不经 HTTP）。数据库、缓存、第三方 SDK 等基础设施放 `src/lib/`，是 api 专属，不进共享包。中间件（`src/middleware/`）只负责横切关注点（认证、日志、错误处理、CORS），不依赖业务。

错误统一经 `app.onError` 归一化为业务可用的 envelope（复用 `@kkfive/contracts` 的错误类型）。SSE 用 `hono/streaming` 的 `c.streamSSE`，帧格式与前端 `@kkfive/http-client` 的流式解析对齐。

废弃「同进程直调 Controller」模式——api 即真实后端，前端通过 `hc` RPC 类型化调用，不再需要中间逻辑共享层。
