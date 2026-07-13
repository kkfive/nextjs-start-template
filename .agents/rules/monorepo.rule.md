# Monorepo Rule

仓库采用 pnpm workspace + Turborepo，分 `apps/`（独立应用，各自完整生命周期）、`packages/`（共享能力，被 apps 消费）、`internal/`（工具链配置，不对外发布）三层。

依赖流向单向：`packages/` 不依赖任何 `apps/`；`internal/` 不依赖 `apps/` 或 `packages/`；应用之间不建立运行时依赖。Hono 类型链的唯一例外是 `apps/{client,admin}/src/service/rpc-*.ts` 通过 `import type` 消费 `api.AppType`，对应 manifest 仅声明 `api: workspace:*` devDependency。

`packages/*` 保持各自通用边界（见 `packages.rule`）。业务 calls、hooks 与组件留在所属 app 的 feature；只有框架无关且出现真实跨 app 消费的能力才提取为 package。

packages 走源码消费，不预 build；Next.js app 经 `transpilePackages`、`apps/api` 经 tsup 消费 workspace 源码。workspace 内部引用使用 `workspace:*`。pnpm 严格解析与 workspace validator 检查依赖声明，Syncpack 只负责外部依赖版本一致性，不承担幽灵依赖检测。
