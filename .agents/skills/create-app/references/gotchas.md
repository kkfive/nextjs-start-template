# Gotchas

## app 互引

- **`apps/A` import `apps/B`** → 应用之间禁止互相依赖；共享内容提取为 package
- **新 app 漏注册 workspace** → 根 `tsconfig.json` references 追加；确认 `pnpm-workspace.yaml` 含 `'apps/*'`

## 配置未继承

- **tsconfig 不 extends 预设** → 每个新 app 必须继承 `@kkfive/tsconfig/{nextjs|hono}.json`
- **next.config 手写导致 client/admin 配置漂移** → 用 `withRepoConfig`（`@kkfive/nextjs-config`）合并
- **eslint.config 手写** → import `@kkfive/lint-config` 预设，按需追加 app 专属规则

## transpilePackages

- **Next.js app 漏配 `transpilePackages`** → 消费的 workspace 包源码不被编译，报错；每个 `@kkfive/*` 都要加
- **Hono app 误用 transpilePackages** → Hono 无此配置；开发用 tsx，生产用 tsup 打包
- **新增 package 后忘记加进 app 的 transpilePackages** → 新包接入时同步更新所有消费 app

## HttpService 注入

- **`apps/api` 注入 HttpService 调自己** → 同进程直调 domain-core Controller，不经 HTTP
- **Next.js app 注入错实例** → client 用 `index.client`（浏览器），admin SSR 用 `index.server`（服务端）
- **实例写进共享包** → 实例是 app 专属，放各 app 的 `src/service/`；共享包只有抽象（`@kkfive/http-client`）

## Domain 适配层

- **适配层重写核心业务逻辑** → 核心在 `@kkfive/domain-core`；适配层只 re-export + 注入实例 + 可选 hooks
- **适配层 import `@/components/*`** → 适配层不依赖 UI
- **把 React Query hooks 写进 `@kkfive/domain-core`** → 共享包框架无关；hooks 留各 Next.js app 适配层
