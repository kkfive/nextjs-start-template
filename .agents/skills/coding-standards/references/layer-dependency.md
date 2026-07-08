# 层级依赖规则

## 跨包禁止的导入

```
❌ packages/* → apps/*                    （共享包不依赖应用）
❌ apps/A → apps/B                         （应用之间不互相依赖）
❌ packages/domain-core → React/Next/Hono  （共享包框架无关）
❌ packages/contracts, packages/utils → 任何运行时框架
❌ packages/ui → @kkfive/contracts（除非纯类型）/ antd / 业务代码
❌ internal/* → apps/* 或 packages/*
```

## 跨包允许的导入

```
✅ apps/* → @kkfive/*（contracts/domain-core/http-client/utils/ui）
✅ apps/* → @kkfive/{tsconfig,lint-config,...}（internal 工具链）
✅ packages/domain-core → @kkfive/contracts, @kkfive/utils（http-client 为 peer）
✅ packages/http-client → @kkfive/contracts（peer）
✅ packages/ui → react/react-dom（peer）, shadcn/Radix, Tailwind
```

## 应用内禁止的导入（Next.js apps：client / admin）

```
❌ apps/{app}/domain/ → @/components/*
❌ apps/{app}/domain/ → @/hooks/*
❌ apps/{app}/domain/ → @/store/*
❌ apps/{app}/domain/ → @/app/*
```

## 应用内允许的导入（Next.js apps）

```
✅ apps/{app}/domain/ → @kkfive/domain-core, @kkfive/contracts, @kkfive/http-client
✅ apps/{app}/domain/ → @/service/*（注入 HttpService 实例）
✅ apps/{app}/domain/ → @tanstack/react-query（仅 hooks 适配）
✅ apps/{app}/src/components/domain/ → @domain/*, @kkfive/ui, @/components/ui/*
✅ apps/{app}/src/app/ → @domain/*, @kkfive/*, @/components/*, @/lib/*
```

## 应用内禁止的导入（Hono app：api）

```
❌ apps/api/domain/ → @kkfive/http-client   （同进程直调，不经 HttpService）
❌ apps/api/domain/ → src/routes/*, 任何 HTTP 框架 API
```

## 核心原则

- **共享包框架无关**：`packages/domain-core` 禁止导入 React/Next/Hono；React Query hooks 留在各 Next.js app 的 Domain 适配层，不进共享包
- **单向依赖**：应用层可以导入共享包，反之不行；`apps/` 之间不互相依赖
- **实例由 app 注入**：HttpService 抽象在 `@kkfive/http-client`，具体实例由各 app 的 `src/service/` 创建并注入到 domain-core 的 Controller
- **packages 通用性**：只在某一 app 用到的东西不进 `packages/`，先在 app 内实现，等第二个消费方再提取
