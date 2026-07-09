# Monorepo Rule

仓库采用 pnpm workspace + Turborepo 的 monorepo 结构，分为 `apps/`（独立应用，各自完整生命周期）、`packages/`（共享能力，被 apps 消费）、`internal/`（工具链配置预设，不对外发布）三层。

依赖流向单向：`packages/` 不可依赖任何 `apps/`；`apps/` 之间不可互相依赖；`internal/` 不可依赖 `apps/` 或 `packages/`，仅装构建工具链。各 package 的专属约束（框架无关、零运行时依赖等）见对应包级 `AGENTS.md`。

`packages/*` 必须保持通用性，只抽离真正可复用的内容。判断标准是"换一个新项目还能直接用吗"——不能就留在 app 内部。宁可晚抽离：先在 app 内实现，等出现第二个消费方再提取为 package。

packages 走源码消费，不预 build；各 Next.js app 通过 `transpilePackages` 直接消费 workspace 包源码，`apps/api` 通过 tsx/tsup 消费。workspace 内部引用使用 `workspace:*` 协议。幽灵依赖由 pnpm 严格模式、syncpack 与 ESLint 规则共同防御，每个新 package 必须显式声明全部依赖。
