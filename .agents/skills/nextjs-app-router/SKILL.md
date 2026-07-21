---
name: nextjs-app-router
description: Next.js App Router 路由与 runtime 行为。用于 `apps/*/src/app/**` 下的 page/layout/loading/error、Route Handler、Server Action、Server/Client Component 边界、缓存、流式渲染或 Metadata；不用于 feature 业务实现、普通 React 组件或 Pages Router。
user-invocable: true
---

# Next.js App Router

## Scope

- 用于 App Router 页面、布局、Route Handler、Server Action、缓存、Metadata 与 Server/Client 边界。
- 先遵循 `.agents/rules/next-app.rule.md`，再按当前任务读取一条导航目标。

## Avoid

- feature 业务实现、普通 React 组件与 Pages Router 不使用本 skill。
- 不在路由层承载业务能力；不要默认读取整组 caching、performance 或 gotchas references。

## Common Tasks

| 任务 | 一跳导航 |
|---|---|
| 新增 page、layout、loading 或 error | `workflows/new-page.md` |
| 新增轻量 Route Handler | `workflows/add-api-route.md` |
| 新增 Server Action | `workflows/add-server-action.md` |
| 判断 Server 与 Client Component | `rules/server-vs-client.md` |
| 处理 Server → Client 序列化 | `rules/data-serialization.md` |
| 设计缓存与失效策略 | `references/caching-strategies.md` |
| 查询 App Router 文件约定 | `references/file-conventions.md` |
| 编写 metadata | `references/metadata.md` |
| 优化 Image、dynamic 或 bundle | `references/performance.md` |
| 排查缓存、序列化或路由陷阱 | `references/gotchas.md` |

## Semantic Principles

- `src/app/` 只组合路由能力与 feature 稳定入口，业务逻辑留在 feature。
- 默认使用 Server Component，仅把需要浏览器状态或交互的最小边界声明为 Client。
- Server → Client 边界只传递明确、可序列化的数据。
- `src/app/api/` 只承担轻量 BFF，真实后端业务留在 `apps/api`。
- 缓存策略必须与写入后的失效路径一起设计。
