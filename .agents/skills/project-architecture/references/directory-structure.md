# 目录约定

## 仓库根目录

```
├── apps/                     # 独立应用
│   ├── client/               # Next.js 客户端
│   ├── admin/                # Next.js 管理后台
│   └── api/                  # Hono API 服务
├── packages/                 # 共享包（被 apps 消费）
├── internal/                 # 工具链配置预设（不对外发布）
├── scripts/                  # 可执行脚本入口（verify-conventions 等）
├── docs/                     # 仓库级文档
├── .agents/                  # AI 辅助开发规范（根级，全局生效）
├── turbo.json                # Turborepo 任务编排
├── pnpm-workspace.yaml       # pnpm workspace 定义
└── mise.toml                 # 工具链版本管理
```

## 应用目录（Next.js apps：client / admin）

```
apps/{app}/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── {route}/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── api/              # 轻量 BFF（Route Handlers）
│   ├── components/
│   │   ├── ui/               # 基础 UI 入口（来自 @kkfive/ui）
│   │   ├── common/           # 通用功能组件
│   │   ├── {module}/         # 业务组件（耦合特定领域）
│   │   └── providers.tsx     # 全局 Providers
│   ├── hooks/                # React Query hooks（各 app 自写）
│   ├── lib/                  # 工具库（request/、errors/、utils）
│   ├── store/                # Zustand stores
│   ├── config/               # 应用配置
│   ├── service/              # 适配层（HTTP + hc RPC 双实例）
│   │   ├── http-client.ts    # 浏览器 HttpService（client-only）
│   │   ├── http-server.ts    # 服务端 HttpService（server-only）
│   │   ├── rpc-client.ts     # createRpcClient(httpClient)（client-only）
│   │   ├── rpc-server.ts     # createRpcClient(httpServer)（server-only）
│   │   ├── http-external.ts  # 第三方 API calls（可选）
│   │   └── index.sse.ts      # SSE 实例（可选）
│   └── __tests__/            # 测试工具和 mocks
├── public/                   # 静态资源
├── next.config.ts            # extends @kkfive/nextjs-config + transpilePackages
├── tsconfig.json             # extends @kkfive/tsconfig/nextjs.json
├── eslint.config.js          # imports @kkfive/lint-config
└── package.json
```

**组件分类说明**：

| 目录 | 用途 | 特点 | 示例 |
|------|------|------|------|
| `ui/` | 基础 UI 入口 | 底层来自 `@kkfive/ui`，按需扩展；无业务逻辑 | Button, Input, Modal |
| `common/` | 通用功能组件 | 可复用的功能性组件，与业务相关但不依赖特定领域 | PdfViewer, ImageCropper |
| `{module}/` | 业务组件 | 结合特定业务逻辑，调用 `@kkfive/rpc` calls | MaterialDocumentViewer, HitokotoCard |

## 应用目录（Hono app：api）

```
apps/api/
├── src/
│   ├── routes/               # Hono 路由（zod 校验 + 业务编排）
│   ├── middleware/           # Hono 中间件（认证、日志、错误处理、CORS）
│   ├── lib/                  # 服务端基础设施（DB 客户端、缓存、第三方 SDK）
│   └── app.ts                # Hono app 入口（导出 export type AppType）
├── tsconfig.json             # extends @kkfive/tsconfig/hono.json
├── eslint.config.js          # imports @kkfive/lint-config
└── package.json              # dev: tsx watch；build: tsup
```

## 共享包目录（`packages/*`）

```
packages/{pkg}/
├── src/
│   └── ...                   # 源码（不预 build，exports 直接指向 src）
├── tsconfig.json             # extends @kkfive/tsconfig/base.json，composite + references
└── package.json              # exports 指向 src/index.ts
```

`packages/rpc/` 内部按业务模块组织：

```
packages/rpc/src/
└── {module}/                 # 业务模块（纯调用函数）
    ├── calls.ts              # 业务调用函数（接收 RpcClient 参数）
    └── index.ts              # 模块公开入口（如需子路径导出）
```

`packages/contracts/` 内部按业务模块组织：

```
packages/contracts/src/
└── {module}/                 # 业务模块（zod schema + z.infer 类型）
    ├── schema.ts             # zod schema 定义
    └── type.ts               # z.infer 类型导出
```

## 适配层模式（`apps/{app}/src/service/`）

```
apps/{app}/src/service/
├── http-client.ts            # new HttpService({ ... })（client-only）
├── http-server.ts            # new HttpService({ ... })（server-only）
├── rpc-client.ts             # createRpcClient(httpClient, baseUrl)（client-only）
├── rpc-server.ts             # createRpcClient(httpServer, baseUrl)（server-only）
├── http-external.ts          # 第三方 API calls（可选，app 专属）
└── index.sse.ts              # SSE 实例（可选）
```

**规则**：
- 双实例由 `server-only`/`client-only` 在文件级强制隔离
- hc 经 `createRpcClient(http, baseUrl)` 复用 HttpService 实例的拦截器链
- 实例是 app 专属，不进共享包

## 文件放置规则

| 文件类型 | 位置 | 示例 |
|----------|------|------|
| 页面组件 | `apps/{app}/src/app/{route}/page.tsx` | `apps/client/src/app/demo/page.tsx` |
| 轻量 BFF 路由 | `apps/{app}/src/app/api/{endpoint}/route.ts` | `apps/client/src/app/api/revalidate/route.ts` |
| 基础 UI | `apps/{app}/src/components/ui/{component}/` | `apps/client/src/components/ui/button/` |
| 通用功能组件 | `apps/{app}/src/components/common/{component}/` | `apps/client/src/components/common/pdf-viewer/` |
| 业务组件 | `apps/{app}/src/components/{module}/` | `apps/client/src/components/material/` |
| 自有 api 共享 calls | `packages/rpc/src/{module}/calls.ts` | `packages/rpc/src/example-request/calls.ts` |
| Zod schema + 类型 | `packages/contracts/src/{module}/` | `packages/contracts/src/schemas/` |
| HTTP 实例 / hc 客户端 | `apps/{app}/src/service/` | `apps/client/src/service/rpc-client.ts` |
| 工具函数（通用） | `packages/utils/src/` | `packages/utils/src/string.ts` |
| 工具函数（app 专属） | `apps/{app}/src/lib/` | `apps/client/src/lib/utils.ts` |
| React Query hooks | `apps/{app}/src/hooks/use-{name}.ts` | `apps/client/src/hooks/use-example.ts` |
| Zustand Store | `apps/{app}/src/store/{name}-store.ts` | `apps/client/src/store/mouse-store.ts` |
| 测试文件 | 与源文件同目录 `{name}.test.ts` | `apps/client/src/lib/utils.test.ts` |
