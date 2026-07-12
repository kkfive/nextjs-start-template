---
name: project-architecture
description: monorepo 架构组织规范 - apps/packages/internal 三层、Feature-first、运行时 service 边界、路由组合、依赖规则、目录约定、命名规范。用于决定新代码该放哪一层、检查跨层/跨包 import 是否合规、初始化新模块的目录结构。
primary: true
user-invocable: true
---

# Project Architecture

## Scope
- Target: pnpm workspace + Turborepo monorepo 的分层组织
- Cover: apps/packages/internal 三层、Feature-first 应用内分层、依赖规则、目录约定、命名规范
- Avoid: 单文件级的 TypeScript / React 写法（去 `/coding-standards`）；包内分层细节（去 `.agents/rules/packages.rule.md`）

**边界声明**：本 skill 回答"代码该放哪、跨层/跨包依赖能不能 import"；同主题更细的细节去：
- 文件级写法、import 规则 → `/coding-standards`
- 跨包/跨层 import 黑名单 → `/coding-standards` 的 `references/layer-dependency.md`
- 路由 / 页面 → `/nextjs-app-router`
- 新建共享包 / 新建应用 → `.agents/meta/create-package/SKILL.md`、`.agents/meta/create-app/SKILL.md`

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新代码该放哪一层（app 内 / 包内） | `references/architecture-overview.md` |
| 跨层或跨包 import 是否合规 | `references/architecture-overview.md` + `references/gotchas.md` |
| 新模块的目录结构 | `references/directory-structure.md` |
| 文件 / 目录 / 标识符如何命名 | `references/naming-conventions.md` |
| 踩坑：循环依赖 / 误用 @/app / 跨包误引 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 分层简图

```
monorepo:
  apps/         独立应用（client / admin / api，各自 build/deploy）
  packages/     共享包（contracts / http-client / rpc / utils / ui）
  internal/     工具链配置（tsconfig / lint-config / tailwind-config / nextjs-config）

每个 Next.js app（apps/client、apps/admin）内部:
  src/features/          业务能力（视图、calls、hooks、状态、模型、内部测试）
  src/service/           仅 HTTP/RPC/SSE 实例（server-only/client-only 隔离）
  src/components/        跨 feature 的真实通用 UI 与 providers
  src/lib/               工具函数、错误处理
  src/app/               路由 / 页面 / Server Action

apps/api (Hono，真实后端):
  src/routes/            路由（zod 校验 + 业务编排，导出 export type AppType）
  src/middleware/        中间件（认证/日志/CORS/错误）
  src/lib/               服务端基础设施（DB/缓存/第三方 SDK）
```

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| `packages/*` 里 import `apps/*`（运行时） | 共享包不依赖应用（rpc 仅 type-only 引 AppType） |
| `src/service/` 里写业务逻辑 | service 只创建运行时实例；业务 calls、hooks、状态和视图放所属 feature |
| `packages/ui` 里 import 业务代码或 antd | 基础 UI 保持通用、不含 antd |
| `src/app/` 写可复用组件或业务编排 | 组合 `src/features/` 公开入口；跨 feature UI 才下沉到 `src/components/` |
| 目录用 `userProfile` | 用 `user-profile` (kebab-case) |
| client 组件 import `rpc-server` | server/client 双实例由 server-only/client-only 强制隔离 |

## Session Discipline

每次进入"新增文件/新建模块"任务时**重新阅读本 SKILL.md** 与 `references/architecture-overview.md`，确认放对层与对包。

## 相关 Skills

- `/coding-standards`：层级内部的 TS / React 写法 + 跨层 import 黑名单
- `/nextjs-app-router`：`apps/*/src/app/` 的路由约定
- `.agents/meta/create-package/SKILL.md`、`.agents/meta/create-app/SKILL.md`：新建共享包/新建应用
