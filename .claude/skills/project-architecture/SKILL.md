---
name: project-architecture
description: 项目三层架构组织规范 - Domain / 基础设施 / UI / 路由分层、依赖规则、目录约定、命名规范。用于决定新代码该放哪一层、检查跨层 import 是否合规、初始化新模块的目录结构。
user-invocable: true
---

# Project Architecture

## Scope
- Target: Next.js 16 + React 19 三层架构组织
- Cover: 层级分离、依赖规则、目录约定、命名规范
- Avoid: 单文件级的 TypeScript / React 写法（去 `/coding-standards`）；Domain 模块内部细节（去 `/domain-layer`）

**边界声明**：本 skill 回答"代码该放哪、跨层依赖能不能 import"；同主题更细的细节去：
- 文件级写法、import 规则 → `/coding-standards`
- Domain 模块结构 → `/domain-layer`
- 路由 / 页面 → `/nextjs-app-router`

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新代码该放哪一层 | `references/architecture-overview.md` |
| 跨层 import 是否合规 | `references/architecture-overview.md` + `references/gotchas.md` |
| 新模块的目录结构 | `references/directory-structure.md` |
| 文件 / 目录 / 标识符如何命名 | `references/naming-conventions.md` |
| 踩坑：循环依赖 / 误用 @/app | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 三层简图

```
domain/                  业务能力（HTTP 注入，框架无关 + hooks 适配例外）
src/lib/、src/service/   基础设施（HTTP 实例、运行环境适配）
src/components/ui/       基础 UI（封装 antd）
src/components/common/   通用功能组件（无业务）
src/components/domain/   领域 UI（业务 × UI）
src/app/                 路由 / 页面 / Server Action
```

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| `domain/` 里 import `@/components/*` | Domain 不依赖 UI |
| `src/components/ui/` 里 import `@domain/*` | UI 通用层不依赖业务 |
| `src/components/common/` 里 import 第三方 UI | 通用组件经 `@/components/ui/*` |
| `src/app/` 写可复用组件 | 下沉到 `src/components/` |
| 目录用 `userProfile` | 用 `user-profile` (kebab-case) |

## Session Discipline

每次进入"新增文件/新建模块"任务时**重新阅读本 SKILL.md** 与 `references/architecture-overview.md`，确认放对层。

## 相关 Skills

- `/coding-standards`：层级内部的 TS / React 写法
- `/domain-layer`：Domain 模块内部分层
- `/nextjs-app-router`：`src/app/` 的路由约定
