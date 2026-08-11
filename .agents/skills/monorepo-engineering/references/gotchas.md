# 踩坑速查

## 1. Turborepo v1 `pipeline` 已改名 v2 `tasks`

外部 skill（skills.sh 上的 monorepo 系列）大量仍用 v1 的 `pipeline` 字段。本项目用 v2，**字段名是 `tasks`**。照抄外部 skill 的 turbo.json 会引入陈旧写法。

- v1: `{ "pipeline": { "build": { ... } } }`
- v2: `{ "tasks": { "build": { ... } } }`

## 2. 源码消费 ≠ 预构建，不要倒退

本项目 packages 走源码消费（exports 指向 `./src/index.ts`，Next.js `transpilePackages` 编译）。外部 skill 普遍推荐 `tsup` 预构建 + exports 指向 `dist/`——**与本项目理念相反，不要采纳**。源码消费省去 build 步骤、调试更直接。

## 3. 环境变量变化导致 stale cache

build task 若不声明 `env`，改 `.env` / `NEXT_PUBLIC_*` 后 build 命中旧 cache → 产出 stale 产物。**必须**在 task 的 `env` 声明影响构建的环境变量，顶层 `globalEnv`/`globalDependencies` 声明全局影响项。

排查方法：`pnpm exec turbo run build --dry=json` 看 hash inputs 是否含目标 env。

## 4. affected 不能用于全局一致性检查

`--filter` 只跑受影响包。但 lint 规范一致性、typecheck 类型安全、verify-conventions 跨包规范——这些是**全局**检查，不能 affected。原则：**耗时任务（build/test）增量，全局检查（lint/typecheck/verify）全量**。

## 5. `$TURBO_DEFAULT$` 是默认输入组

`inputs: ["$TURBO_DEFAULT$"]` 包含该包源码 + 配置 + 依赖声明。在其上用 `!` 排除无关文件（`!**/*.md`、`!**/*.test.*`）提升命中率。不要从零列举 inputs，容易漏。

## 6. 静态规则 vs 工程化：边界

单向依赖规则定义在 `layer-dependency.md`，机器实现位于 `scripts/repo-tooling/architecture-policy/`。规则语义变化时同时更新 reference、rule module 与 valid/invalid fixtures，不能只改文档。

## 7. 依赖方向由 architecture policy 统一检查

`scripts/repo-tooling/architecture-policy/` 同时解析源码 import 与 manifest 依赖，规则集中在 `rules/` 并由 registry 执行。pnpm 严格模式负责解析隔离，Syncpack 只检查版本一致性；不要把两者描述成架构方向校验器。应用内与跨包边界均通过现有 FFG rules 扩展，不另建第二套 lint package。
