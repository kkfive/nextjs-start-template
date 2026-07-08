# Packages Rule

`packages/*` 通过 `package.json` 的 `exports` 直接指向源码（`./src/index.ts`），不产出 build 产物。开发期由消费方（Next.js 的 `transpilePackages` 或 Hono 的 tsx/tsup）编译。

每个 package 的 `tsconfig.json` 继承 `@kkfive/tsconfig/base.json`，启用 `composite: true` 并通过 `references` 声明依赖的 workspace 包，让根级 `tsc --build` 跨包增量检查。

依赖必须完整且最小：`contracts` 和 `utils` 零运行时依赖；`domain-core` 仅依赖 `contracts` / `utils`，并把 `http-client` 声明为 peerDependency；`http-client` 把 `contracts` 声明为 peerDependency；`ui` 把 `react` / `react-dom` 声明为 peerDependency。任何未显式声明的 import 在 pnpm 严格模式下直接解析失败。

包内路径别名（`@/*`）在各包自身 tsconfig 定义，不跨包；跨包引用统一走 `@kkfive/<pkg>` workspace 协议。新增 package 必须在根 `pnpm-workspace.yaml`、根 `tsconfig.json` 的 references 中注册。
