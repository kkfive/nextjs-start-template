---
name: hono-api
description: apps/api Hono 扩展后端服务规范 - 路由组织、schema 校验、中间件链、错误处理、SSE 流式。仅在 apps/api 包内使用。用于新建 Hono 路由、编写中间件、对接 @kkfive/contracts 校验、明确主后端（client Route Handler）与扩展后端（apps/api）的边界。
user-invocable: true
---

# Hono API

## Scope
- Target: `apps/api`（Hono 扩展后端；常规请求走 client Route Handler，见 `next-app.rule.md`）
- Cover: 路由组织、schema 校验、中间件链、错误处理、SSE 流式
- Avoid: Next.js 前端 / client Route Handler 主后端（去 `/nextjs-app-router`）

**先加载项目原则**：项目根 `.agents/rules/hono.rule.md`。本 skill 只提供执行流程与示例，不重述规则。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新建一个 Hono 路由端点 | `workflows/new-route.md` |
| 新增中间件（认证/日志/CORS/错误） | `workflows/add-middleware.md` |
| 用 schema 校验请求入参 | `references/schema-validation.md` |
| 踩坑：扩展后端 vs 主后端边界 / 中间件顺序 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 主后端 vs 扩展后端边界

- **client Route Handler（`apps/*/src/app/api/`）**：主后端。处理常规请求——聚合 / 转发 / 改格式 / 轻量业务，返回 `ok`/`fail` envelope。
- **`apps/api`（Hono）**：扩展后端。需要 Hono 时才走：类型化 hc RPC（见 `/demo/rpc`）、SSE 流式、鉴权 / 数据持久化 / 业务编排 / 外部 API 代理，独立部署。

业务逻辑闭环在 `apps/api` 的路由 handler 内（用 `@kkfive/contracts` 的 zod schema 校验），不经 domain-core / Controller 共享层（已撤）。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 路由里堆砌复杂业务规则 | 复杂业务在 `src/routes/` 内组织为纯函数辅助 |
| 在 `apps/api` 注入 HttpService 调自己 | 路由 handler 内直接处理（同进程） |
| 路由直接读写数据库 / 拼 SQL | 数据访问下沉到 `src/lib/` 基础设施 |
| 中间件依赖业务 | 中间件只做横切（认证/日志/CORS） |
| 不校验请求体直接用 | 用 `@kkfive/contracts` schema 校验 |
| 常规请求也走 apps/api | 常规请求走 client Route Handler，apps/api 留给需要 Hono 的场景 |

## Session Discipline

每次新进入 `apps/api/**` 任务时**重新阅读项目根 `.agents/rules/hono.rule.md`** 与本 SKILL.md。

## 相关 Skills

- `/nextjs-app-router`：client Route Handler 主后端与常规请求通道
- `/project-architecture`：monorepo 分层与 apps/api 定位
