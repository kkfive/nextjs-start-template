---
name: project-architecture
description: monorepo 目录与 dependency boundary 决策。仅用于用户明确要求改变代码归属、模块拆分、跨层/跨包依赖边界，或创建新 app/package；按现有 Feature-first 模板新增普通 page、feature、public entry 或实现既定路由组合不触发，也不处理 Turbo/CI 工程化。
primary: true
user-invocable: true
---

# Project Architecture

## Scope

- 用于用户明确提出的代码归属变更、模块拆分、新建 app/package 与跨层/跨包依赖边界决策。
- 命中具体架构问题后，只读取 `Common Tasks` 中对应的一条 reference。

## Avoid

- 按现有 Feature-first 模板新增普通 page、feature 或 public entry 属于实现任务，不触发本 skill；使用路径 owner rule、`/nextjs-app-router` 与 `/coding-standards`。
- 单文件 TypeScript/React 写法使用 `/coding-standards`；App Router 操作使用 `/nextjs-app-router`。
- Turbo、CI 与机器治理使用 `/monorepo-engineering`；不要默认读取 naming 或 gotchas references。

## Common Tasks

| 任务 | 一跳导航 |
|---|---|
| 判断代码归属或跨层依赖 | `references/architecture-overview.md` |
| 设计新模块目录结构 | `references/directory-structure.md` |
| 确定文件、目录或标识符命名 | `references/naming-conventions.md` |
| 排查循环依赖、deep import 或误归属 | `references/gotchas.md` |

## Semantic Principles

- apps 独立构建部署，packages 只承载已有真实跨 app 复用的能力。
- Next.js app 采用 Feature-first，业务视图、calls、hooks、状态与模型归属 feature。
- `src/service/` 只创建并隔离 HTTP/RPC/SSE 运行时实例，不承载业务逻辑。
- 跨层与跨包依赖稳定公开入口，避免 deep import 和兼容透传层。
- 新建模块或共享定义前先检索已有实现与归属边界。
