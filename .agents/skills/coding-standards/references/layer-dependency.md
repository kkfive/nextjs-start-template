# 层级依赖规则

## 跨包允许的导入

```text
✅ apps/* → @kkfive/rpc, @kkfive/ui, @kkfive/http-client, @kkfive/utils
✅ apps/* → @kkfive/{tsconfig,lint-config,...}（internal 工具链）
✅ packages/rpc → @kkfive/contracts(type), @kkfive/http-client
✅ packages/rpc → apps/api 的 AppType（仅 import type）
✅ packages/http-client → @kkfive/contracts（peer）
✅ packages/ui → react/react-dom（peer）, shadcn/Radix, Tailwind
```

## 跨包禁止的导入

```text
❌ packages/* → apps/*（运行时；rpc 引 api AppType 仅限 type-only）
❌ apps/A → apps/B（应用之间不互相依赖）
❌ packages/ui → antd / 业务代码
❌ packages/contracts, packages/utils → 任何运行时框架
❌ internal/* → apps/* 或 packages/*
❌ 任何层 → 零价值 re-export 透传层
```

## 应用内依赖（Next.js apps）

```text
✅ apps/{app}/src/app/ → @/features/* 的公开入口、路由元数据、Next.js 能力
✅ apps/{app}/src/features/ → @/service/* 的运行时实例、@/components/*、@/lib/*、共享包
✅ apps/{app}/src/service/ → HTTP/RPC/SSE 依赖、server-only/client-only
❌ apps/{app}/src/app/ → feature 内部私有实现
❌ apps/{app}/src/service/ → @/features/*、@/components/*、@/app/*、业务 hooks/store
❌ feature A → feature B 的内部文件（只允许明确公开入口）
```

## 应用内依赖（Hono app：api）

```text
✅ apps/api/src/routes/ → @/features/* 的公开入口、@kkfive/contracts、@/lib/*、@/middleware/*
✅ apps/api/src/features/ → @kkfive/contracts、@/lib/*
❌ apps/api → @kkfive/utils/dom（服务端只引 @kkfive/utils/common）
❌ apps/api/src/features/ → 路由文件、任何前端框架、@kkfive/http-client
```

## 核心原则

- **Feature-first**：app 业务能力按 `src/features/<feature>/` 聚合；路由只组合，service 只留运行时实例
- **单向依赖**：应用层可导入共享包，反之不行（rpc 引 api AppType 是 type-only 例外）
- **实例由 app 创建**：HttpService 抽象在 `@kkfive/http-client`，具体 HTTP/RPC/SSE 实例在 app 的 `src/service/`
- **无兼容层**：消费公开入口而非旧路径；不得为迁移建立 alias、re-export 或 shim
