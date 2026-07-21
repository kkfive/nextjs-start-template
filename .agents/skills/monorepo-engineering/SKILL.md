---
name: monorepo-engineering
description: monorepo 工程化规范。用于修改 Turborepo/Turbo cache、CI affected filter、pnpm workspace、internal 工具链或 repository architecture-policy 机器规则；不因普通页面、一般 package 代码或目录归属讨论自动触发。
user-invocable: true
---

# Monorepo Engineering

## Scope

- 用于 Turbo cache、CI affected、workspace 与 architecture-policy 的工程化任务。
- 命中具体任务后，只读取 `Common Tasks` 中对应的一条 workflow 或 reference。

## Avoid

- 代码归属与依赖规则本身使用 `/project-architecture`；文件级写法使用 `/coding-standards`。
- 普通页面或 package 实现不触发本 skill；CI 中出现 `test` / `build` job 只是工程任务名，不触发 `coding-standards`，除非实际修改 TypeScript、React、import 或 `*.test.*` / `*.spec.*` 源码。
- 不要默认读取全部 workflows 或 `references/gotchas.md`。

## Common Tasks

| 任务 | 一跳导航 |
|---|---|
| 优化 Turbo cache 或排查 cache miss | `workflows/optimize-turbo-cache.md` |
| 配置 CI affected filter | `workflows/setup-ci-affected.md` |
| 将依赖方向规则落实为机器校验 | `workflows/enforce-dependency-direction.md` |
| 查询 Turbo v2 配置语法 | `references/turbo-v2-config.md` |
| 排查 cache、env 或源码消费陷阱 | `references/gotchas.md` |

## Semantic Principles

- 静态边界由 owner rule 定义，本 skill 只负责可执行的工程化落实。
- cache identity 必须同时覆盖输入、输出与影响产物的环境变量。
- affected 优化只用于适合增量执行的任务，仓库级静态治理保持全量。
- workspace package 保持当前源码消费模型，除非任务明确改变发布边界。
