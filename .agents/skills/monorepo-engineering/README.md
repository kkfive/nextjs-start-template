# Monorepo Engineering

monorepo **工程化流水线**的操作型 skill：把 `/project-architecture` 定义的静态规则（分层、单向依赖）工程化为可执行的构建缓存、CI 策略、机器校验。

## 何时用

- 优化 Turborepo 构建缓存命中率、排查 stale cache
- 配置 CI 只跑受影响包（affected filter）
- 给 `scripts/verify-conventions.mjs` 加跨包依赖方向校验
- 不确定 turbo.json v2 怎么写

## 不何时用（边界）

- 代码该放哪一层 / import 合不合规 → `/project-architecture`
- 文件级 TS / React 写法 → `/coding-standards`
- 单向依赖**规则本身** → `coding-standards/references/layer-dependency.md`（本 skill 只负责机器化执行）

## 文件结构

- `SKILL.md` — 入口与边界声明
- `workflows/` — cache 优化、CI affected、依赖方向校验的按需流程
- `references/` — turbo v2 配置范例、踩坑速查

## 核心定位

静态规则（分层、依赖方向）的定义在 `/project-architecture` 与 `layer-dependency.md`；本 skill 负责 cache、CI 增量和 `scripts/repo-tooling/architecture-policy/` 的机器执行。
