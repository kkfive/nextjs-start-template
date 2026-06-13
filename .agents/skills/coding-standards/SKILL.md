---
name: coding-standards
description: TypeScript / React 文件级编码规范 - 层级 import 黑名单、UI 组件导入路径、type vs interface、函数式组件、错误类、Iconify 图标、vitest + MSW 测试。用于写组件代码、解决 import 报错、统一类型定义风格、引入图标。
user-invocable: true
---

# Coding Standards

## Scope
- Target: TypeScript + React 文件级写法 + 测试
- Cover: 层级 import 黑名单、UI 导入路径、类型定义、组件模式、错误处理、图标、测试
- Avoid: 三层架构整体决策（去 `/project-architecture`）；Domain 模块内部分层（去 `/domain-layer`）

**边界声明**：本 skill 回答"具体一行代码该怎么写"；同主题更宏观的去：
- 三层架构与目录分层 → `/project-architecture`
- Domain 模块结构 → `/domain-layer`
- 样式 → `/styling-system`

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 跨层 import 报错 / 黑名单 | `references/layer-dependency.md` |
| antd 组件该从哪 import | `references/ui-import-rules.md` |
| `type` 还是 `interface` | `references/typescript-rules.md` |
| Domain 模块的 `type.ts` 怎么写 | `references/domain-types.md` |
| 函数式组件、`'use client'` | `references/react-patterns.md` |
| 错误处理 / `ApiError` / `AppError` | `references/error-handling.md` |
| 图标 Iconify + Tailwind | `references/icon-usage.md` |
| 测试 vitest + MSW | `references/testing.md` |
| 踩坑：类型导出 / `as any` / 测试 mock | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| `import { Button } from 'antd'`（业务代码） | `from '@/components/ui/button'` |
| `interface User {}` | `type User = {}` |
| `export const Component = () => {}` | `export function Component() {}` |
| `as any` / `@ts-ignore` | 改 type；如必须用 `as unknown as X` 并注释 |
| Domain 里 import `@/components/*` | Domain 不依赖 UI |
| 测试直接打真网络 | 用 MSW 拦截 |

## Session Discipline

每次写新文件时**重新阅读对应 reference**：黑名单与 import 规则可能随重构更新。

## 相关 Skills

- `/project-architecture`：三层架构与跨层依赖宏观规则
- `/domain-layer`：Domain 模块内部分层
- `/ant-design`：antd 组件 API 与查询要求
