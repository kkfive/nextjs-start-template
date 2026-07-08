---
name: project-architecture
description: monorepo 架构组织规范 - apps/packages/internal 三层、应用内 Domain 适配层/基础设施/UI/路由分层、依赖规则、目录约定、命名规范。用于决定新代码该放哪一层、检查跨层/跨包 import 是否合规、初始化新模块的目录结构。
user-invocable: true
---

# Project Architecture

## Scope
- Target: pnpm workspace + Turborepo monorepo 的分层组织
- Cover: apps/packages/internal 三层、应用内分层、依赖规则、目录约定、命名规范
- Avoid: 单文件级的 TypeScript / React 写法（去 `/coding-standards`）；Domain 适配层内部细节（去 `/domain-layer`）

**边界声明**：本 skill 回答"代码该放哪、跨层/跨包依赖能不能 import"；同主题更细的细节去：
- 文件级写法、import 规则 → `/coding-standards`
- Domain 适配层与 `@kkfive/domain-core` 的关系 → `/domain-layer`
- 路由 / 页面 → `/nextjs-app-router`
- 新建共享包 / 新建应用 → `/create-package`、`/create-app`

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
  packages/     共享包（contracts / domain-core / http-client / utils / ui）
  internal/     工具链配置（tsconfig / lint-config / tailwind-config / nextjs-config）

每个 Next.js app（apps/client、apps/admin）内部:
  domain/                 Domain 适配层（re-export @kkfive/domain-core + 注入 HttpService + React Query hooks）
  src/lib/、src/service/  基础设施（HTTP 实例、运行环境适配）
  src/components/ui/      基础 UI 入口（来自 @kkfive/ui）
  src/components/common/  通用功能组件（无业务）
  src/components/domain/  领域 UI（业务 × UI）
  src/app/                路由 / 页面 / Server Action
```

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| `packages/*` 里 import `apps/*` | 共享包不依赖应用 |
| app 的 `domain/` 里 import `@/components/*` | Domain 适配层不依赖 UI |
| `packages/ui` 里 import 业务代码或 antd | 基础 UI 保持通用、不含 antd |
| `src/app/` 写可复用组件 | 下沉到 `src/components/` |
| 目录用 `userProfile` | 用 `user-profile` (kebab-case) |

## Session Discipline

每次进入"新增文件/新建模块"任务时**重新阅读本 SKILL.md** 与 `references/architecture-overview.md`，确认放对层与对包。

## 相关 Skills

- `/coding-standards`：层级内部的 TS / React 写法
- `/domain-layer`：Domain 适配层与共享包的分层
- `/nextjs-app-router`：`apps/*/src/app/` 的路由约定
- `/create-package`、`/create-app`：新建共享包/新建应用
