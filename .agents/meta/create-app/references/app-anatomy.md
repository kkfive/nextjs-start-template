# App 结构与配置继承详解

## Next.js app 目录结构（client / admin）

```
apps/{app}/
├── domain/                        # Domain 适配层
│   └── {module}/                  # re-export @kkfive/domain-core + 注入 + 可选 hooks
├── src/
│   ├── app/                       # Next.js App Router
│   ├── components/                # UI（ui/ + common/ + domain/）
│   ├── lib/                       # 工具函数、错误处理
│   ├── service/                   # HTTP 实例注入
│   │   ├── index.client.ts        # 浏览器实例
│   │   ├── index.server.ts        # 服务端实例
│   │   └── index.sse.ts           # SSE 实例
│   ├── hooks/                     # React Hooks
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
├── domain/                        # Domain 适配层（仅 re-export，无 hooks、无注入）
│   └── {module}/
├── src/
│   ├── routes/                    # Hono 路由（HTTP 协议适配）
│   ├── middleware/                # 中间件（认证/日志/CORS/错误）
│   ├── lib/                       # 服务端基础设施（DB/缓存/第三方 SDK）
│   └── app.ts                     # Hono app 入口
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
      "@/*": ["./src/*"],
      "@domain/*": ["./domain/*"]
    }
  }
}

// Hono app
{
  "extends": "@kkfive/tsconfig/hono.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@domain/*": ["./domain/*"]
    }
  }
}
```

> `@kkfive/*` 不走 tsconfig paths，走 workspace 协议（pnpm 自动解析）。tsconfig paths 仅用于 app 内部别名。

### next.config.ts（Next.js apps）

```ts
import { withRepoConfig } from '@kkfive/nextjs-config'

export default withRepoConfig({
  transpilePackages: ['@kkfive/contracts', '@kkfive/domain-core', '@kkfive/http-client', '@kkfive/utils', '@kkfive/ui'],
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
    "@kkfive/domain-core": "workspace:*",
    "@kkfive/http-client": "workspace:*",
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
    "@kkfive/domain-core": "workspace:*",
    "@kkfive/utils": "workspace:*",
    "hono": "..."
  }
}
```

> `apps/api` 不依赖 `@kkfive/http-client`（同进程直调，不经 HttpService）。

## HttpService 注入（Next.js apps）

各 Next.js app 的 `src/service/` 创建实例，注入到 domain-core 的 Controller：

```ts
// apps/client/src/service/index.client.ts
import { HttpService } from '@kkfive/http-client'
export const httpClient = new HttpService({ prefix: '/api', /* 浏览器配置 */ })

// apps/admin/src/service/index.server.ts
import { HttpService } from '@kkfive/http-client'
export const serverClient = new HttpService({ prefix: 'https://api.example.com', /* 服务端配置 */ })
```

实例是 app 专属，不进共享包（抽象在 `@kkfive/http-client`）。

## Domain 适配层模式

```ts
// apps/client/domain/{module}/index.ts — Next.js client
export * from '@kkfive/domain-core/{module}'         // re-export
export { useXxx } from './hooks'                      // app 专属 hooks

// apps/admin/domain/{module}/index.ts — Next.js admin（可能无 hooks）
export * from '@kkfive/domain-core/{module}'

// apps/api/domain/{module}/index.ts — Hono（仅 re-export，无 hooks、无注入）
export * from '@kkfive/domain-core/{module}'
```
