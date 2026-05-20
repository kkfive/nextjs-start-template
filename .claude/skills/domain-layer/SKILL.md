---
name: domain-layer
description: Domain 层架构规范 - HttpService 依赖注入、Service/Controller/Hooks 分层、命名空间导出、React Query 适配。用于在 domain/ 下新建模块、编写 Service/Controller/hooks、解决跨层 import 和测试隔离问题。
user-invocable: true
---

# Domain Layer

## Scope
- Target: `domain/` 目录下的业务能力建模
- Cover: HttpService 注入、Service/Controller/Hooks 分层、类型与命名、模块入口
- Avoid: UI 组件、路由、样式（属于其他层，分别去 `/coding-standards`、`/nextjs-app-router`、`/styling-system`）

**先加载项目原则**：项目根 `.rules/domain.rule.md`。本 skill 只提供执行流程与示例，不重述规则。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新建一个 Domain 模块 | `workflows/create-module.md` |
| 写 / 改 Service（原始请求） | `workflows/write-service.md` |
| 写 / 改 Controller（业务编排） | `workflows/write-controller.md` |
| 写 / 改 hooks（React Query 封装） | `references/hooks-layer.md` |
| HttpService 依赖注入规则 | `references/dependency-injection.md` |
| 文件如何组织（const / type / service / controller / hooks / index） | `references/file-structure.md` |
| 命名规范（模块名、文件名、Query Keys） | `references/naming-conventions.md` |
| 完整示例（auth、material 模块） | `references/examples.md` |
| 踩坑：循环依赖 / hooks 漏注入 / 类型导出 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| `import { http } from '@/service'` 写在 Service 里 | `service.x(http: HttpService, ...)` 注入 |
| `http` 不在第一个参数 | `http` 永远第一参 |
| `export class Controller` | `export async function getList(...)` 命名函数 |
| `interface Type {}` | `type Type = {}` |
| 入口 `export * from './controller'` | `export * as Controller from './controller'` 命名空间 |
| hooks 直接调 Service 跳过 Controller | hooks 调 Controller，Controller 调 Service |

## Session Discipline

每次进入 `domain/` 任务时**重新阅读项目根 `.rules/domain.rule.md`** 与本 SKILL.md。规则与示例可能因新模块的真实需求演化。

## 相关 Skills

- `/coding-standards`：TypeScript / React 编码规范
- `/project-architecture`：三层架构与目录约定
- `/nextjs-app-router`：在 Server Component / Server Action 中调用 Controller
