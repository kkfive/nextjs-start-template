---
name: monorepo-engineering
description: monorepo 工程化流水线规范 - Turborepo cache 精细化（inputs/outputs/globalDependencies/globalEnv/env）、CI affected filter、跨包单向依赖机器校验（G07）。用于优化构建缓存命中率、配置 CI 只跑受影响包、排查 stale cache、给 verify-conventions 加依赖方向校验规则。
user-invocable: true
---

# Monorepo Engineering

## Scope
- Target: pnpm workspace + Turborepo monorepo 的**工程化流水线**（构建缓存、CI、依赖方向机器校验）
- Cover: turbo.json cache 精细化、CI affected filter、跨包单向依赖的机器校验
- Avoid: 代码该放哪 / import 合不合规（去 `/project-architecture`）；文件级 TS/React 写法（去 `/coding-standards`）

**边界声明**：本 skill 回答"构建怎么缓存、CI 怎么只跑受影响包、已定义的依赖规则如何机器校验"。
- 分层 / 目录 / 单向依赖**规则本身** → `/project-architecture`（静态结构）+ `coding-standards/references/layer-dependency.md`
- 本 skill 只答：**如何把这些规则工程化**（缓存配置、CI filter、机器校验脚本）

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 优化构建缓存 / 排查 cache miss / stale | `workflows/optimize-turbo-cache.md` |
| CI 只跑受影响包 / 配置 affected filter | `workflows/setup-ci-affected.md` |
| 单向依赖机器校验 / 加 verify 规则 | `workflows/enforce-dependency-direction.md` |
| turbo.json v2 怎么写 | `references/turbo-v2-config.md` |
| 踩坑：v1 pipeline / 源码消费 vs 预构建 / env stale | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 核心原则

- **静态规则在 `/project-architecture`，本 skill 只做工程化**：单向依赖规则定义在 layer-dependency.md，本 skill 负责把它变成机器校验（G07）
- **cache 三要素**：`inputs`（哪些文件计入 hash）+ `outputs`（缓存什么产物）+ `env`/`globalEnv`（哪些环境变量计入 hash）
- **affected 与全局并存**：耗时任务（build/test）用 affected；全局一致性检查（lint/typecheck/verify:conventions）保持全量
- **源码消费不预构建**：packages 走 `transpilePackages` 消费源码，不引入 tsup/dist 预构建（与外部 skill 的"预构建"方案相反）

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 照抄外部 skill 的 v1 `pipeline` | 用 v2 `tasks` |
| build 不声明 `env` | 声明影响构建产物的环境变量（NEXT_PUBLIC_* 等） |
| 把 packages exports 改指向 `dist/` | 源码消费，指向 `./src/index.ts` |
| 全局检查也加 affected filter | lint/typecheck/verify 保持全量 |
| 用 madge/boundaries 重造依赖校验 | 扩展 verify-conventions.mjs（项目已有 G 规则模式） |

## Session Discipline

每次进入"改 turbo.json / 改 CI / 加构建或依赖校验"任务时**重新阅读本 SKILL.md**。turbo 配置与 CI 策略随项目规模演化。

## 相关 Skills

- `/project-architecture`：分层与单向依赖**规则本身**（本 skill 把这些规则工程化）
- `/coding-standards`：`references/layer-dependency.md` 是 G07 校验的规则源
