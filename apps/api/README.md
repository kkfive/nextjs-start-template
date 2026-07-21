# apps/api

独立后端服务（Hono）。业务逻辑闭环在此，承担数据持久化、业务编排、外部 API 代理。

## 作用

- **路由层**（`src/routes/`）：HTTP 协议适配 + 业务编排，用 `@kkfive/contracts` 的 zod schema 校验入参
- **`AppType`**（`src/app.ts`）：仅由 `apps/client` 与 `apps/admin` 的 `src/service/rpc-*.ts` 通过 `import type { AppType } from 'api'` 消费
- **错误归一化**：经 `app.onError` 统一为 envelope（复用 `@kkfive/contracts` 的 `HttpResponse`）
- **SSE**：`hono/streaming`（hc 不支持流式，客户端经 `@kkfive/http-client` 直连）

## 红线

- 不含前端框架（React 等）、不含 UI
- 业务逻辑闭环在此，前端不共享运行时逻辑层（经 hc RPC 类型化调用）
- 基础设施（DB / 缓存 / SDK）放 `src/lib/`；中间件放 `src/middleware/`（只横切，不依赖业务）

## 消费方式

- 前端：`apps/{client,admin}/src/service/rpc-*.ts` 创建 `hc<AppType>` 实例；所属 feature 的业务 calls 调用这些实例
- SSE：客户端 `@kkfive/http-client` 的 `.sse()` 直连 SSE 路由

## 运行

- `pnpm --filter api dev`（tsx watch，默认端口 8787）
- `pnpm --filter api build`（tsdown）
