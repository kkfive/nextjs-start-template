---
name: coding-standards
description: TypeScript / React 文件级编码规范，处理 import、类型定义、函数式组件、错误类、Iconify 图标及 Vitest + MSW test。用于编写或修改 TypeScript/React 文件、修复 import、统一类型和测试写法；不用于目录/依赖边界整体设计或纯样式主题任务。
user-invocable: true
---

# Coding Standards

## Scope

- 用于 TypeScript、React、import、错误处理、图标与测试的文件级实现决策。
- 命中具体任务后，只读取 `Common Tasks` 中对应的一条 reference 或 workflow。

## Avoid

- 目录归属或跨层架构决策使用 `/project-architecture`；Turbo、CI 与机器校验使用 `/monorepo-engineering`。
- 纯样式与主题任务使用 `/styling-system`；不要默认读取整组 references 或 `references/gotchas.md`。

## Common Tasks

| 任务 | 一跳导航 |
|---|---|
| 新建定义前检索已有实现 | `workflows/search-before-create.md` |
| 判断跨层或跨包 import | `references/layer-dependency.md` |
| 选择 UI 组件导入入口 | `references/ui-import-rules.md` |
| 处理 TypeScript 类型写法 | `references/typescript-rules.md` |
| 定义共享领域类型 | `references/domain-types.md` |
| 编写 React 组件或 Client 边界 | `references/react-patterns.md` |
| 处理项目错误类型 | `references/error-handling.md` |
| 添加 Iconify 图标 | `references/icon-usage.md` |
| 编写 Vitest + MSW 测试 | `references/testing.md` |
| 排查复合型历史陷阱 | `references/gotchas.md` |
| 核验治理规则端到端生效 | `workflows/verify-end-to-end.md` |

## Semantic Principles

- 先检索并复用已有定义，再决定新增文件或导出入口。
- 文件级实现遵循稳定入口，避免绕过 owner rule 深链内部实现。
- 类型与测试表达真实边界，不用 suppression 隐藏设计或运行时问题。
