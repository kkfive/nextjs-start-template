# Hono Rule

`apps/api` 是独立 Hono 后端，用于类型化 RPC、SSE 及需要独立服务进程的能力。当前业务在 `src/routes/` 的 handler 内闭环，用 `@kkfive/contracts` 校验输入并返回统一 envelope；入口 `src/app.ts` 导出 `AppType`，只由前端 app 的 service 层 type-only 消费。

路由层做 HTTP 协议适配与业务编排；复杂逻辑可在对应 route 目录中拆为纯函数。数据库、缓存、第三方 SDK 等 api 专属基础设施需要时放 `src/lib/`；`src/middleware/` 只处理认证、日志、错误和 CORS 等横切关注点。

错误统一经 `app.onError` 归一化为业务可用的 envelope（复用 `@kkfive/contracts` 的 `ok`/`fail`）。SSE 是 Hono 的扩展能力（client Route Handler 不承担流式），用 `hono/streaming` 的 `c.streamSSE`，帧格式与前端 `@kkfive/http-client` 的流式解析对齐；客户端经 `NEXT_PUBLIC_API_URL` 直连 apps/api 的 SSE 路由。

前端访问 Hono 时，由 feature-local call 使用 `src/service/rpc-client.ts` 或 `rpc-server.ts` 提供的实例；`packages/rpc` 只提供泛型客户端工厂与 envelope 工具。
