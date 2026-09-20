---
name: nextjs-app-router
description: App Router 页面、布局、Route Handler、Server Action、Server/Client 边界、缓存或 Metadata；不处理 feature 业务和 Pages Router。
user-invocable: true
---

# Next.js App Router

先遵循 `.agents/rules/next-app.rule.md`，再读取一项。框架通识（文件约定、Metadata API、缓存 API、Server/Client 机制）不在此复述，仅保留项目约束与真实踩坑。

| 任务 | 导航 |
|---|---|
| page/layout/loading/error | `workflows/new-page.md` |
| Route Handler | `workflows/add-api-route.md` |
| Server Action | `workflows/add-server-action.md` |
| 缓存失效约定 | `references/caching-strategies.md` |
| 陷阱 | `references/gotchas.md` |
