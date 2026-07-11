# App 结构与配置继承详解

## Next.js app 目录结构（client / admin）

```
apps/{app}/
├── src/
│   ├── app/                       # Next.js App Router
│   ├── components/                # UI（ui/ + common/ + 业务组件）
│   ├── hooks/                     # React Query hooks（各 app 自写，缓存策略自治）
│   ├── lib/                       # 工具函数、错误处理
│   ├── service/                   # 适配层（HTTP + hc RPC 双实例）
│   │   ├── http-client.ts         # 浏览器 HttpService 实例（client-only）
│   │   ├── http-server.ts         # 服务端 HttpService 实例（server-only）
│   │   ├── rpc-client.ts          # 浏览器 hc = createRpcClient(httpClient)（client-only）
│   │   ├── rpc-server.ts          # 服务端 hc = createRpcClient(httpServer)（server-only）
│   │   ├── http-external.ts       # 第三方 API calls（可选，app 专属）
│   │   └── index.sse.ts           # SSE 实例（可选）
│   ├── store/                     # Zustand stores
│   └── config/                    # 应用配置
├── public/                        # 静态资源
├── next.config.ts                 # 继承 @kkfive/nextjs-config
├── tsconfig.json                  # 继承 @kkfive/tsconfig/nextjs.json
├── eslint.config.js               # 继承 @kkfive/lint-config
└── package.json
```

## Hono app 目录结构（api）

```
apps/api/
├── src/
│   ├── routes/                    # Hono 路由（zod 校验 + 业务编排 + 外部 API 代理）
│   ├── middleware/                # 中间件（认证/日志/CORS/错误）
│   ├── lib/                       # 服务端基础设施（DB/缓存/第三方 SDK）
│   └── app.ts                     # Hono app 入口（导出 export type AppType）
├── tsconfig.json                  # 继承 @kkfive/tsconfig/hono.json
├── eslint.config.js               # 继承 @kkfive/lint-config
└── package.json                   # dev: tsx watch；build: tsup
```

## 配置继承

### tsconfig.json

```json
// Next.js app
{
  "extends": "@kkfive/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// Hono app
{
  "extends": "@kkfive/tsconfig/hono.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> `@kkfive/*` 不走 tsconfig paths，走 workspace 协议（pnpm 自动解析）。tsconfig paths 仅用于 app 内部别名。

### next.config.ts（Next.js apps）

```ts
import { withRepoConfig } from '@kkfive/nextjs-config'

export default withRepoConfig({
  transpilePackages: ['@kkfive/contracts', '@kkfive/http-client', '@kkfive/rpc', '@kkfive/utils', '@kkfive/ui'],
  // app 专属配置
})
```

### eslint.config.js

```js
import { preset } from '@kkfive/lint-config'
export default preset({
  // app 专属规则
})
```

## package.json 依赖声明

### Next.js app

```json
{
  "dependencies": {
    "@kkfive/contracts": "workspace:*",
    "@kkfive/http-client": "workspace:*",
    "@kkfive/rpc": "workspace:*",
    "@kkfive/utils": "workspace:*",
    "@kkfive/ui": "workspace:*",
    "next": "...",
    "react": "...",
    "react-dom": "..."
  }
}
```

### Hono app

```json
{
  "dependencies": {
    "@kkfive/contracts": "workspace:*",
    "@kkfive/utils": "workspace:*",
    "hono": "..."
  }
}
```

> `apps/api` 不依赖 `@kkfive/http-client` 或 `@kkfive/rpc`（它是后端，不是前端 HTTP 调用方）。

## 适配层模式（Next.js apps：src/service/）

各 Next.js app 的 `src/service/` 创建 HTTP 实例和 hc RPC 客户端，双实例由 `server-only`/`client-only` 物理隔离：

```ts
// apps/client/src/service/http-client.ts — 浏览器 HttpService
import 'client-only'
import { HttpService } from '@kkfive/http-client'
export const httpClient = new HttpService({ prefix: '/api', /* 浏览器配置 */ })

// apps/client/src/service/rpc-client.ts — 浏览器 hc RPC 客户端
import 'client-only'
import { createRpcClient } from '@kkfive/rpc'
import { httpClient } from './http-client'
export const rpcClient = createRpcClient(httpClient, '/api')

// apps/client/src/service/http-server.ts — 服务端 HttpService（SSR / cookie / token）
import 'server-only'
import { HttpService } from '@kkfive/http-client'
export const httpServer = new HttpService({ prefix: process.env.API_BASE_URL, /* 服务端配置 */ })

// apps/client/src/service/rpc-server.ts — 服务端 hc RPC 客户端（SSR）
import 'server-only'
import { createRpcClient } from '@kkfive/rpc'
import { httpServer } from './http-server'
export const rpcServer = createRpcClient(httpServer, process.env.API_BASE_URL)
```

实例和 hc 客户端都是 app 专属，不进共享包。hc 经 `createRpcClient(http, baseUrl)` 复用 HttpService 实例的拦截器链（retry / hooks / 401 / 错误归一化），不再造实例。

## Hooks 模式（各 app 自写）

React Query hooks 调用 `@kkfive/rpc` 的纯调用函数，缓存策略各 app 自治：

```ts
// apps/client/src/hooks/use-example.ts
import { useQuery } from '@tanstack/react-query'
import { fetchExample } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'
export function useExample() {
  return useQuery({ queryKey: ['example'], queryFn: () => fetchExample(rpcClient) })
}
```

> `@kkfive/rpc` 不含 react-query/react——hooks 不在共享包，各 app 自行组装。
