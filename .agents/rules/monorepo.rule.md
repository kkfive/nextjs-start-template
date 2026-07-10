# Monorepo Rule

仓库采用 pnpm workspace + Turborepo，分 `apps/`（独立应用，各自完整生命周期）、`packages/`（共享能力，被 apps 消费）、`internal/`（工具链配置，不对外发布）三层。

依赖流向单向：`packages/` 不可运行时依赖任何 `apps/`；`apps/` 之间不可互相依赖；`internal/` 不可依赖 `apps/` 或 `packages/`。**唯一例外**：`packages/biz` 经 **type-only import** 引用 `apps/api` 的 `AppType`（Hono RPC 端到端类型链源头），不引入运行时依赖。

`packages/*` 保持各自通用边界（见 `packages.rule` 包分类与红线）。判断共享包内容是否该抽离的标准仍是「换一个新项目还能直接用吗」——不能就留在 app；业务专用内容进 `biz`（业务包，不追求跨项目通用）。宁可晚抽离：先在 app 实现，等出现第二个消费方再提取。

packages 走源码消费，不预 build；各 Next.js app 经 `transpilePackages` 消费 workspace 包源码，`apps/api` 经 tsx/tsup 消费。workspace 内部引用用 `workspace:*` 协议。幽灵依赖由 pnpm 严格模式、syncpack 与 ESLint 规则共同防御，每个新 package 必须显式声明全部依赖。
