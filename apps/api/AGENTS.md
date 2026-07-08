# apps/api 协作准则（Hono）

本文件继承根 `AGENTS.md` 的全部规则，并补充 `apps/api`（Hono 后端服务）的专属约束。当本文件与根级冲突时，以本文件为准（但仍不可违反根级硬性约束，如 import 边界、packages 通用性）。

## 定位

`apps/api` 是真正的后端服务进程（Hono），承担鉴权、数据持久化、业务编排等后端职责，独立部署、独立扩缩容。它不是边缘函数或 BFF——BFF 由 Next.js apps 的 `src/app/api/` 承担，仅做聚合/转发。

## Always Load（继承 + 补充）

@.agents/rules/core.rule.md
@.agents/rules/monorepo.rule.md
@.agents/rules/hono.rule.md

## 关键约束

### 路由层只做 HTTP 适配

- `src/routes/` 仅负责：解析请求、用 `@kkfive/contracts` schema 校验、调用 Controller、格式化响应
- 业务逻辑在 `@kkfive/domain-core` 的 Controller，路由不写业务规则（if/循环/字段转换）

### 同进程直调 domain-core

- Domain 适配层（`apps/api/domain/`）同进程直调 Controller，**不经过 HttpService、不注入 HTTP 客户端、无 React hooks**
- 不依赖 `@kkfive/http-client`（那是给 Next.js apps 跨进程调用的）

### 基础设施自治

- 数据库客户端、缓存、第三方 SDK 放 `src/lib/`，是 api 专属，不进共享包
- 中间件（`src/middleware/`）只做横切关注点（认证/日志/错误处理/CORS），不依赖 Domain

### app 内依赖

| 层                | 可以导入                                                      | 禁止导入                                                  |
| ----------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| `domain/`         | `@kkfive/domain-core`、`@kkfive/contracts`、`@/lib/*`、外部库 | `src/routes/*`、任何 HTTP 框架 API、`@kkfive/http-client` |
| `src/routes/`     | `domain/*`、`@kkfive/contracts`、`@/lib/*`、`@/middleware/*`  | `domain/` 内部文件（通过入口导入）                        |
| `src/middleware/` | `@/lib/*`、外部库                                             | `domain/*`、`src/routes/*`                                |

## 构建与运行

- `dev`: `tsx watch src/app.ts`（走源码消费，无需预 build packages）
- `build`: `tsup`（打包整个 app，含 workspace 包源码）
- tsconfig 继承 `@kkfive/tsconfig/hono.json`（无 DOM lib）

## 参考

- 根级规范：`../../AGENTS.md`
- Hono 任务引导：`.agents/skills/hono-api/SKILL.md`
- 重构决策：`docs/decisions/monorepo-restructuring.md`
