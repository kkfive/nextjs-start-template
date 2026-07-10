# 层级依赖规则

## 跨包允许的导入

```
✅ apps/* → @kkfive/biz, @kkfive/ui, @kkfive/http-client, @kkfive/utils
✅ apps/* → @kkfive/{tsconfig,lint-config,...}（internal 工具链）
✅ packages/biz → @kkfive/contracts(type), @kkfive/ui, @kkfive/http-client
✅ packages/biz → apps/api 的 AppType（type-only only，端到端类型链）
✅ packages/http-client → @kkfive/contracts（peer）
✅ packages/ui → react/react-dom（peer）, shadcn/Radix, Tailwind
```

## 跨包禁止的导入

```
❌ packages/* → apps/*（运行时；biz 引 api AppType 仅限 type-only）
❌ apps/A → apps/B（应用之间不互相依赖）
❌ packages/ui → antd / 业务代码
❌ packages/contracts, packages/utils → 任何运行时框架
❌ internal/* → apps/* 或 packages/*
❌ 任何层 → 零价值 re-export 透传层（见 ui-import-rules）
```

## 应用内依赖（Next.js apps）

```
✅ apps/{app}/src/app/ → @kkfive/biz, @kkfive/ui, @/components/*, @/lib/*
✅ apps/{app}/src/components/ → @kkfive/ui, @kkfive/biz, @/lib/*
✅ apps/{app}/domain/ → @kkfive/biz（re-export + 注入运行时）
❌ apps/{app}/domain/ → @/components/*, @/hooks/*, @/store/*, @/app/*, @/lib/*
```

## 应用内依赖（Hono app：api）

```
✅ apps/api/src/routes/ → @kkfive/contracts, src/domain/*, src/lib/*
✅ apps/api/src/domain/ → @kkfive/contracts, src/lib/*
❌ apps/api → @kkfive/utils/dom（服务端只引 @kkfive/utils/common）
❌ apps/api/src/domain/ → 任何前端框架（React 等）
```

## 核心原则

- **api 闭环逻辑**：业务逻辑在 `apps/api` 路由层，前端经 `hc<AppType>` 类型化调用，不共享运行时逻辑层
- **单向依赖**：应用层可导入共享包，反之不行（biz 引 api AppType 是 type-only 例外）
- **实例由 app 注入**：HttpService 抽象在 `@kkfive/http-client`，具体实例由各 app 创建并注入 biz 的 hc client
- **无透传**：消费 `@kkfive/ui` 直接 import，不做 `export * from` 中间层
