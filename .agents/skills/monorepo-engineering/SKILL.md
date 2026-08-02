---
name: monorepo-engineering
description: Turbo、CI affected、pnpm workspace、internal 工具链或 architecture-policy 的工程化；普通业务实现不触发。
user-invocable: true
---

# Monorepo Engineering

只读取当前任务对应的一项：

| 任务 | 导航 |
|---|---|
| Turbo cache | `workflows/optimize-turbo-cache.md` |
| CI affected | `workflows/setup-ci-affected.md` |
| 机器化依赖边界 | `workflows/enforce-dependency-direction.md` |
| Turbo v2 语法 | `references/turbo-v2-config.md` |
| 工程陷阱 | `references/gotchas.md` |

静态语义由 owner rule 定义，本 Skill 负责可执行实现。cache identity 覆盖输入、输出与环境；全局治理不使用 affected 缩窄。
