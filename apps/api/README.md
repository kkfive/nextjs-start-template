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

## 运行与部署

### 本地 Node.js

```bash
pnpm --filter api dev
```

默认监听 `8787`；生产构建和启动：

```bash
pnpm --filter api build
PORT=8787 CORS_ORIGINS=http://localhost:5373,http://localhost:5374 pnpm --filter api start
```

运行时环境变量：

| 变量           | 说明                                                          |
| -------------- | ------------------------------------------------------------- |
| `PORT`         | Node/Docker 监听端口，默认 `8787`                             |
| `CORS_ORIGINS` | 允许的浏览器 Origin，使用英文逗号分隔；未配置时不放行跨域来源 |

`NEXT_PUBLIC_API_URL` 和 `API_BASE_URL` 属于前端应用配置，不是 API runtime 变量。

### Docker

仓库级 Docker 构建、Compose 运行、环境变量和 CI 配置统一参阅 [Docker 构建与运行指南](../../docs/docker.md)。

API 镜像使用 Node 24、pnpm 11、多阶段构建和非 root 用户，启动入口为 `dist/server.mjs`。

### Vercel

在 Vercel 中从同一仓库创建独立 Project：

- Root Directory：`apps/api`
- Framework：Hono（`vercel.json` 已声明）
- 开启读取 Root Directory 之外的 monorepo 文件
- 在 Project Environment Variables 配置 `CORS_ORIGINS`

`api/index.ts` 是 Vercel 入口，只导出 Hono app，不启动 Node 端口。部署 Preview 后至少检查 `/health`、错误 envelope、CORS 预检和 SSE。

### Cloudflare Workers

```bash
pnpm --filter api types:cloudflare
pnpm --filter api dev:cloudflare
pnpm --filter api deploy:cloudflare
```

非敏感变量可通过 Cloudflare dashboard 或 Wrangler vars 配置；敏感值使用：

```bash
pnpm --filter api exec wrangler secret put VARIABLE_NAME
```

当前 Worker binding 支持 `CORS_ORIGINS`。修改 `wrangler.jsonc` 后重新运行 `pnpm --filter api types:cloudflare` 并提交生成的 `worker-configuration.d.ts`。

### SSE 平台差异

`/example/request/sse` 使用 Web Streams，可在三个入口复用；但 Vercel Functions 和 Cloudflare Workers 有执行时长、CPU 与连接生命周期限制。短流应在真实 Preview 上验证，长期或无限 SSE 优先使用 Docker/Node 常驻部署；需要 Cloudflare 上的持久连接或跨实例状态时另行评估 Durable Objects。

## 验证

```bash
pnpm --filter api test:run
pnpm --filter api typecheck
pnpm --filter api build
pnpm --filter api exec wrangler deploy --dry-run
curl --fail http://localhost:8787/health
```
