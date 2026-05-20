---
name: nextjs-app-router
description: Next.js 14+ App Router 路由、Server/Client Components、数据获取、缓存、Server Actions、流式渲染、Metadata、性能优化。用于在 src/app/ 下新建页面/布局/Route Handler/Server Action、判断是否需要 'use client'、配置缓存与重新验证、为页面写 SEO Metadata。
user-invocable: true
---

# Next.js App Router

## Scope
- Target: Next.js 14+ App Router 架构（本项目为 Next.js 16 + React 19）
- Cover: Server/Client Components、数据获取、缓存、Server Actions、流式渲染、Metadata、性能优化、路由约定
- Avoid: Pages Router；与 Domain 层耦合（业务逻辑放 `domain/`）

先加载项目原则：项目根规则文件 `next-app.rule.md`（位于 `.rules` 目录）。本 skill 只提供执行流程、决策与示例，不作为规则源。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新增页面 / 布局 / loading / error | `workflows/new-page.md` |
| 新增 API Route Handler | `workflows/add-api-route.md` |
| 新增 Server Action | `workflows/add-server-action.md` |
| 需要 `'use client'` 还是 Server？ | `rules/server-vs-client.md` |
| Server → Client 边界传值报错 | `rules/data-serialization.md` |
| 配置 `revalidate` / `tags` / `no-store` | `references/caching-strategies.md` |
| layout/page/loading/error/route 等约定 | `references/file-conventions.md` |
| 写页面 `metadata` / `generateMetadata` | `references/metadata.md` |
| `next/image`、`dynamic()`、Bundle 优化 | `references/performance.md` |
| 踩坑：序列化失败 / 缓存不刷新 / 嵌套过深 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| Server Component 里写 `useState`/`useEffect` | 加 `'use client'` 或下沉到子组件 |
| Client Component 里 `fetch` 业务数据 | Server Component 获取后传 props |
| Server → Client 传 `Map` / `class` 实例 | 只传 JSON 可序列化数据 |
| 忘记 `loading.tsx` / `Suspense` | 为慢数据加流式边界 |
| 改完数据不 `revalidateTag` | Server Action 中显式失效缓存 |

## Session Discipline

每次新进入 `src/app/` 任务时**重新阅读本 SKILL.md**，不要凭"上一轮记得"作业 —— Common Tasks 路由可能已调整。

## 相关 Skills

- `/coding-standards`：React 组件模式（函数声明、`'use client'` 标记）
- `/project-architecture`：路由层与组件层的边界
- `/ant-design`：SSR/StyleProvider 配置
