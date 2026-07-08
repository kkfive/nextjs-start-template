---
name: hono-api
description: apps/api Hono 后端服务规范 - 路由组织、schema 校验、同进程直调 domain-core、中间件链、错误处理。用于新建 Hono 路由、编写中间件、对接 @kkfive/contracts 校验、明确 BFF 与后端的边界。
user-invocable: true
---

# Hono API

## Scope
- Target: `apps/api`（Hono 后端服务进程）
- Cover: 路由组织、schema 校验、中间件链、错误处理、同进程直调 domain-core
- Avoid: Next.js 前端（去 `/nextjs-app-router`）；业务纯逻辑编写（去 `/domain-layer`，逻辑写在 `@kkfive/domain-core`）

**先加载项目原则**：项目根 `.agents/rules/hono.rule.md`。本 skill 只提供执行流程与示例，不重述规则。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新建一个 Hono 路由端点 | `workflows/new-route.md` |
| 新增中间件（认证/日志/CORS/错误） | `workflows/add-middleware.md` |
| 用 schema 校验请求入参 | `references/schema-validation.md` |
| 在路由里调用 domain-core | `references/domain-direct-call.md` |
| 踩坑：路由 vs 业务边界 / 中间件顺序 / 同进程直调误用 HttpService | `references/gotchas.md` |

源头表见 `routing.yaml`。

## BFF vs 后端边界

- **`apps/api`（Hono）**：真正的后端服务。鉴权、读写数据库、业务编排，独立部署。
- **Next.js apps 的 `src/app/api/`**：轻量 BFF。仅聚合/转发/改格式，核心业务仍在 `apps/api`。

`apps/api` 同进程直调 `@kkfive/domain-core` 的 Controller，**不经过 HttpService、不注入 HTTP 客户端、无 React hooks**。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 路由里写业务规则（if/循环/数据转换） | 业务逻辑下沉到 `@kkfive/domain-core` Controller |
| 在 `apps/api` 注入 HttpService 调自己 | 同进程直调 Controller |
| 路由直接读写数据库 / 拼 SQL | 数据访问在 Controller 或 `src/lib/` 基础设施 |
| 中间件依赖 Domain | 中间件只做横切（认证/日志/CORS） |
| 不校验请求体直接用 | 用 `@kkfive/contracts` schema 校验 |

## Session Discipline

每次新进入 `apps/api/**` 任务时**重新阅读项目根 `.agents/rules/hono.rule.md`** 与本 SKILL.md。

## 相关 Skills

- `/domain-layer`：`@kkfive/domain-core` 共享包的业务纯逻辑
- `/nextjs-app-router`：Next.js apps 的轻量 BFF（与后端的边界）
- `/project-architecture`：monorepo 分层与 apps/api 定位
