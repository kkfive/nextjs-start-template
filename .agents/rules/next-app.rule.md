# Next App Rule

每个 Next.js app 的 `src/app` 表达路由、布局和运行时入口，不承载可复用组件。多个 app 各自独立构建、独立部署，共享 `@kkfive/*` 包。

页面应组合已有 `src/service` 适配层、UI 和基础设施能力。可复用视图下沉到该 app 的 `src/components`，请求实例（HttpService）与 hc RPC 客户端的运行时适配放在该 app 的 `src/service`，app 专属纯逻辑放 `src/lib`。

`src/service` 按运行环境物理隔离为双实例：浏览器侧（`http-client.ts` / `rpc-client.ts`，`import 'client-only'`）与服务端侧（`http-server.ts` / `rpc-server.ts`，`import 'server-only'`）。环境边界由 `server-only` / `client-only` 包在文件级强制——禁止靠 `typeof window` 运行时判断替代；server component 只 import `*-server`，client component 只 import `*-client`。

Server Component 是默认选择；只有交互、浏览器 API、客户端状态或 React Query hooks 需要时，才引入 `'use client'`。各 app 的配置（Next.js / Tailwind / tsconfig）通过继承 `internal/*` 预设保持一致。
