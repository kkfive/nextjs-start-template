# Next App Rule

每个 Next.js app 的 `src/app` 表达路由、布局和运行时入口，不承载可复用组件。多个 app 各自独立构建、独立部署，共享 `@kkfive/*` 包。

页面应组合已有 `src/service` 适配层、UI 和基础设施能力。可复用视图下沉到该 app 的 `src/components`，请求实例（HttpService）与 hc RPC 客户端的运行时适配放在该 app 的 `src/service`，自有 api 共享 calls 进 `@kkfive/rpc`，app 专属 calls/纯逻辑放 `src/service` 与 `src/lib`。

`src/app/api/**` 的 Next.js Route Handler 是**主后端**，处理常规请求：聚合 / 转发 / 改格式 / 轻量业务，返回 `@kkfive/contracts` 的 envelope（`ok`/`fail`）。请求双通道：常规请求走 client Route Handler（`httpClient` / `httpServer`，见 `domain.rule.md`）；需要 Hono 时走 rpc 扩展通道（`hc<AppType>` → apps/api，见 `hono.rule.md` 与 `/demo/rpc`）。SSE 流式是 Hono 扩展能力，Route Handler 不承担——客户端经 `NEXT_PUBLIC_API_URL` 直连 apps/api。

`src/service` 按运行环境物理隔离为双实例：浏览器侧（`http-client.ts` / `rpc-client.ts`，`import 'client-only'`）与服务端侧（`http-server.ts` / `rpc-server.ts`，`import 'server-only'`）。环境边界由 `server-only` / `client-only` 包在文件级强制——禁止靠 `typeof window` 运行时判断替代；server component 只 import `*-server`，client component 只 import `*-client`。

Server Component 是默认选择；只有交互、浏览器 API、客户端状态或 React Query hooks 需要时，才引入 `'use client'`。Server Component 直接 `await` 该 domain 的 call 获取首屏数据（不走 react-query），结果可作 `initialData` 透传给 client 组件；Client Component 经 `src/service/{domain}/hooks.ts` 的 react-query hooks 调用，不在组件内直接写请求。各 app 的配置（Next.js / Tailwind / tsconfig）通过继承 `internal/*` 预设保持一致。
