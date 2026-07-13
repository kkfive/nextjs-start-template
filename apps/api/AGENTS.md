# apps/api 协作准则（Hono）

`apps/api` 是独立 Hono 服务进程，提供类型化 RPC、SSE 和需要独立部署的后端能力；Next.js apps 的 `src/app/api/` 处理 app 内轻量 BFF。

继承根 `AGENTS.md` 全部规则，补充本包专属约束。与根级冲突时以根级硬性约束为准。

<always-applicable>

## 关键约束

### 路由层与业务编排

- 当前业务在 `src/routes/` handler 内闭环：解析请求、用 `@kkfive/contracts` 校验、编排并格式化响应
- 复杂逻辑可在对应 route 目录中拆成纯函数，不虚构尚不存在的业务分层
- `src/lib/` 仅放数据库客户端、缓存和第三方 SDK 等基础设施；中间件只做认证、日志、错误处理和 CORS 等横切关注点

### 依赖边界

| 层 | 可以导入 | 禁止导入 |
|---|---|---|
| `src/routes/` | `@kkfive/contracts`、`@/lib/*`、`@/middleware/*` | 前端框架 API、`@kkfive/http-client` |
| `src/middleware/` | `@/lib/*`、外部服务端库 | 业务 route 实现 |

</always-applicable>

<task-routing>

## 构建与运行

- `dev`: `tsx watch src/server.ts`（走源码消费，无需预 build packages）
- `build`: `tsdown`（打包整个 app，含 workspace 包源码）
- tsconfig 继承 `@kkfive/tsconfig/hono.json`（无 DOM lib）

Hono 任务按根 `AGENTS.md` 路由到 `.agents/rules/hono.rule.md`，不维护第二份包级 skill。

## 参考

- 根级规范：`../../AGENTS.md`

</task-routing>
