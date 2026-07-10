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

单向依赖**规则**（packages↛apps 等）定义在 `layer-dependency.md`。本 skill 不重复定义规则，只负责**机器校验**（G07）。规则语义变了，先改 layer-dependency.md；G07 的检测逻辑需手动同步（它读取 import 路径，不读 markdown）。

## 7. G07 只检测相对路径跨层

跨包方向违规几乎只能通过**相对路径**（`../../apps/...`）绕过 workspace 协议。bare import（`@kkfive/*`）的方向由 package.json 依赖声明 + pnpm 严格模式 + syncpack 管控，G07 不重复检测。应用内 domain↛UI 由 `internal/lint-config/rules/domain-boundary.js`（ESLint）覆盖，G07 只补跨包方向。
