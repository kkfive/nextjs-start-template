---
name: nextjs-app-router
description: Next.js App Router 路由、Server/Client Components、数据获取、缓存、Server Actions、流式渲染、Metadata、性能优化。用于在 apps/{app}/src/app/ 下新建页面/布局/Route Handler/Server Action、判断是否需要 'use client'、配置缓存与重新验证、为页面写 SEO Metadata、在多 app 场景下工作。
user-invocable: true
---

# Next.js App Router

## Scope
- Target: Next.js App Router 架构（`apps/client`、`apps/admin` 等 Next.js app）
- Cover: Server/Client Components、数据获取、缓存、Server Actions、流式渲染、Metadata、性能优化、路由约定、多 app 场景
- Avoid: Pages Router；在路由层实现业务逻辑（业务能力在 `src/features/<feature>/`，经各 app `src/service` 的运行时实例调用）

先加载项目原则：项目根规则文件 `next-app.rule.md`（位于 `.agents/rules` 目录）。本 skill 只提供执行流程、决策与示例，不作为规则源。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新增页面 / 布局 / loading / error | `workflows/new-page.md` |
| 新增 API Route Handler（轻量 BFF） | `workflows/add-api-route.md` |
| 新增 Server Action | `workflows/add-server-action.md` |
| 需要 `'use client'` 还是 Server？ | `rules/server-vs-client.md` |
| Server → Client 边界传值报错 | `rules/data-serialization.md` |
| 配置 `revalidate` / `tags` / `no-store` | `references/caching-strategies.md` |
| layout/page/loading/error/route 等约定 | `references/file-conventions.md` |
| 写页面 `metadata` / `generateMetadata` | `references/metadata.md` |
| `next/image`、`dynamic()`、Bundle 优化 | `references/performance.md` |
| 踩坑：序列化失败 / 缓存不刷新 / 嵌套过深 / 多 app 冲突 | `references/gotchas.md` |

## 多 app 注意事项

monorepo 下有多个 Next.js app（`apps/client`、`apps/admin`），各自独立构建部署：
- 路由文件位于各自 `apps/{app}/src/app/`
- 配置继承 `@kkfive/nextjs-config` 预设（含 `transpilePackages`）
- 页面只组合 feature 入口；feature 业务调用使用 `src/service/` 的 `rpc-client` / `rpc-server` 运行时实例，跨 app 共享调用才来自 `@kkfive/rpc`
- `src/app/api/` 仅承担轻量 BFF，真正后端接口在 `apps/api`（Hono）

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| Server Component 里写 `useState`/`useEffect` | 加 `'use client'` 或下沉到子组件 |
| Client Component 里 `fetch` 业务数据 | Server Component 获取后传 props |
| Server → Client 传 `Map` / `class` 实例 | 只传 JSON 可序列化数据 |
| 忘记 `loading.tsx` / `Suspense` | 为慢数据加流式边界 |
| 改完数据不 `revalidateTag` | Server Action 中显式失效缓存 |
| 在 `src/app/api/` 写核心业务逻辑 | BFF 仅做聚合/转发，核心业务在 `apps/api` |

## Session Discipline

每次新进入 `apps/*/src/app/` 任务时**重新阅读本 SKILL.md**，不要凭"上一轮记得"作业 —— Common Tasks 路由可能已调整。

## 相关 Skills

- `/coding-standards`：React 组件模式（函数声明、`'use client'` 标记）
- `/project-architecture`：路由层与组件层的边界、多 app 结构
- `/styling-system`：Ant Design SSR 与主题配置
- `.agents/rules/hono.rule.md`：独立 Hono API 服务边界
