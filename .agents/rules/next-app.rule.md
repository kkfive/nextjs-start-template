# Next App Rule

每个 Next.js app 的 `src/app` 表达路由、布局和运行时入口，不承载可复用组件。多个 app 各自独立构建、独立部署，共享 `@kkfive/*` 包。

页面应仅组合 `src/features/<feature>/` 的入口、路由元数据和 Next.js 路由能力。跨 feature 的真实共享视图与 provider 放 `src/components`；业务视图、calls、hooks、状态和纯逻辑留在所属 feature。HttpService 与 hc RPC 客户端实例放 `src/service`，业务 calls 不进入共享包。

`src/app/api/**` 的 Route Handler 处理 app 内轻量 BFF、聚合与转发，并使用 `@kkfive/contracts` envelope。需要独立 Hono 服务时，由 feature-local call 经 app service 的 `hc<AppType>` 实例访问 `apps/api`；SSE 客户端经 `NEXT_PUBLIC_API_URL` 直连 Hono 路由。

`src/service` 按运行环境物理隔离为双实例：浏览器侧（`http-client.ts` / `rpc-client.ts`，`import 'client-only'`）与服务端侧（`http-server.ts` / `rpc-server.ts`，`import 'server-only'`）。可选 SSE 实例也只放该目录。环境边界由 `server-only` / `client-only` 包在文件级强制——禁止靠 `typeof window` 运行时判断替代；server component 只 import `*-server`，client component 只 import `*-client`。

Server Component 是默认选择；只有交互、浏览器 API、客户端状态或 React Query hooks 需要时，才引入 `'use client'`。Server Component 通过所属 feature 的 call 获取首屏数据（不走 React Query），结果可作 `initialData` 传给 feature 内 client 组件；Client Component 通过 feature 内 React Query hooks 调用，不在组件内直接写请求。各 app 的配置（Next.js / Tailwind / tsconfig）通过继承 `internal/*` 预设保持一致。
