---
name: create-app
description: 新建应用规范 - workspace 注册、继承 internal 配置、transpilePackages、app 内部分层、HttpService 注入。用于在 apps/ 下新建 Next.js 或 Hono 应用、接入 @kkfive/* 共享包、配置应用基础设施。
user-invocable: true
---

# Create App

## Scope
- Target: `apps/*` 下新建应用（Next.js client/admin 或 Hono api）
- Cover: workspace 注册、继承 `internal/*` 配置、`transpilePackages`、app 内部分层、HttpService 注入
- Avoid: 新建共享包（去 `/create-package`）；具体路由/页面写法（去 `/nextjs-app-router` 或 `/hono-api`）

**先加载项目原则**：项目根 `.agents/rules/monorepo.rule.md`、`next-app.rule.md`（Next.js）或 `hono.rule.md`（Hono）。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新建一个 Next.js 应用（完整流程） | `workflows/new-app.md` |
| 新建一个 Hono 应用 | `workflows/new-app.md` |
| app 的目录结构与配置继承 | `references/app-anatomy.md` |
| 注入 HttpService / 接入 domain-core | `references/app-anatomy.md` |
| 踩坑：配置未继承 / transpilePackages 漏配 / 注入错实例 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## app 类型

| 类型 | 目录 | 技术栈 | 关键差异 |
|---|---|---|---|
| Next.js 客户端 | `apps/client` | Next.js + React | 浏览器运行，注入 `httpClient`，有 React Query hooks |
| Next.js 管理后台 | `apps/admin` | Next.js + React | SSR 运行，注入服务端实例 |
| Hono API | `apps/api` | Hono | 同进程直调 domain-core，无 HttpService、无 hooks |

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| app 之间互相 import | 共享内容提取为 package |
| app 不继承 `internal/*` 配置 | tsconfig/eslint/next.config 继承预设 |
| Next.js app 漏配 `transpilePackages` | 消费的每个 `@kkfive/*` 都加进 `transpilePackages` |
| `apps/api` 注入 HttpService | 同进程直调 domain-core |
| 把核心业务写在 app 的 domain 适配层 | 核心逻辑在 `@kkfive/domain-core`，适配层只 re-export + 注入 |

## Session Discipline

每次新建应用时**重新阅读项目根 `.agents/rules/monorepo.rule.md`** 与对应技术栈 rule（`next-app.rule.md` 或 `hono.rule.md`）。

## 相关 Skills

- `/create-package`：新建共享包（app 消费的对象）
- `/nextjs-app-router`：Next.js app 的路由约定
- `/hono-api`：Hono app 的路由约定
- `/project-architecture`：monorepo 分层与 app 定位
