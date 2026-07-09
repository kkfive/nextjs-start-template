---
name: domain-layer
description: Domain 层架构规范 - @kkfive/domain-core 共享纯逻辑 + 各 app 的 Domain 适配层、HttpService 注入、Service/Controller 分层、React Query 适配。用于新建 domain 模块、编写 Service/Controller/hooks、明确共享包与适配层的边界。
user-invocable: true
---

# Domain Layer

## Scope
- Target: `@kkfive/domain-core` 共享包的业务纯逻辑 + 各 app 的 `domain/` 适配层
- Cover: 共享包与适配层的分工、HttpService 注入、Service/Controller 分层、类型与命名、React Query hooks 适配
- Avoid: UI 组件、路由、样式（分别去 `/coding-standards`、`/nextjs-app-router`、`/styling-system`）；新建共享包的脚手架（去 `.agents/meta/create-package/SKILL.md`）

**先加载项目原则**：项目根 `.agents/rules/domain.rule.md`。本 skill 只提供执行流程与示例，不重述规则。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新建一个 Domain 模块（共享包 + 适配层） | `workflows/create-module.md` |
| 写 / 改 Service（原始请求） | `workflows/write-service.md` |
| 写 / 改 Controller（业务编排） | `workflows/write-controller.md` |
| 处理外部接口字段缺失 / `null` | `references/external-data.md` |
| 写 / 改 hooks（React Query 封装，Next.js apps 专属） | `references/hooks-layer.md` |
| HttpService 依赖注入规则 | `references/dependency-injection.md` |
| 共享包与适配层的文件如何组织 | `references/file-structure.md` |
| 命名规范（模块名、文件名、Query Keys） | `references/naming-conventions.md` |
| 完整示例（auth、material 模块） | `references/examples.md` |
| 踩坑：循环依赖 / hooks 漏注入 / 类型导出 / 跨包误引 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 两层结构：共享包 vs 适配层

```
packages/domain-core/src/{module}/    业务纯逻辑（框架无关）
  service.ts / controller.ts / type.ts / const/api.ts / index.ts

apps/{app}/domain/{module}/           Domain 适配层（运行环境包装）
  index.ts   re-export @kkfive/domain-core/{module} + 注入实例 + 可选 hooks
  hooks.ts   Next.js apps 专属：React Query 包装（api 无此文件）
```

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 在 `packages/domain-core` 里 import React/Next/Hono | 共享包框架无关；hooks/路由留各 app |
| 在 app 的 `domain/` 适配层重写业务逻辑 | 适配层只 re-export + 注入实例 + 可选 hooks |
| `import { http } from '@/service'` 写在共享包 Service 里 | `service.x(http: HttpService, ...)` 注入 |
| `http` 不在第一个参数 | `http` 永远第一参 |
| `export class Controller` | `export async function getList(...)` 命名函数 |
| `interface Type {}` | `type Type = {}` |
| 入口 `export * from './controller'` | `export * as Controller from './controller'` 命名空间 |
| hooks 直接调 Service 跳过 Controller | hooks 调 Controller，Controller 调 Service |
| 把业务模型字段批量改成 `?:` | 原始响应用 `ExternalData<T>`，Controller 归一化 |

## Session Discipline

每次进入 `domain/` 或 `packages/domain-core/` 任务时**重新阅读项目根 `.agents/rules/domain.rule.md`** 与本 SKILL.md。规则与示例可能因新模块的真实需求演化。

## 相关 Skills

- `/coding-standards`：TypeScript / React 编码规范
- `/project-architecture`：monorepo 分层与目录约定
- `/nextjs-app-router`：在 Server Component / Server Action 中调用 Controller
- `.agents/meta/create-package/SKILL.md`：新建共享包（`@kkfive/domain-core` 本身的脚手架）
