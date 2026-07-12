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

## 实例注入（src/service 双实例）

- **client component import `rpc-server` 或 `http-server`** → server/client 双实例由 `server-only`/`client-only` 强制隔离；client 组件只能引 `*-client`，server component 只能引 `*-server`
- **hc 客户端自己造实例** → hc 经 `createRpcClient(http, baseUrl)` 复用 HttpService 实例的拦截器链；不要再 `new HttpService()`
- **实例或 hc 客户端写进共享包** → 实例是 app 专属，放各 app 的 `src/service/`；共享包只有抽象（`@kkfive/http-client`）和工厂（`@kkfive/rpc`）
- **SSE 走 hc** → hc 无流式语义；SSE 直连 api 的 SSE 路由，走 `@kkfive/http-client` 的 `.sse()`

## calls 归位

- **自有 API calls 写在错误位置** → 多 app 共享的自有 API calls 进 `@kkfive/rpc`；app 专属 calls 放所属 `src/features/<feature>/`
- **React Query hooks 写进 `@kkfive/rpc` 或 `src/service/`** → rpc 和 service 不含 hooks；hooks 放所属 feature（缓存策略自治）
- **业务组件写进共享包** → 业务组件留各 app `src/features/<feature>/`；共享包不含业务 UI
