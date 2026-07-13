# 架构文档

本文档描述 monorepo 的边界与 Feature-first 应用组织。

## 仓库结构

```text
apps/                         # 独立应用，各自 build/deploy，互不依赖
packages/                     # 共享能力，被 apps 消费
internal/                     # 工具链配置预设，不含业务运行时
docs/                         # 只描述当前使用方式的项目文档
.agents/                      # AI 辅助开发规范
```

`packages/` 保持通用且不引用 app。`AppType` 由 client/admin 的 service 层 type-only 消费；应用之间没有运行时依赖，`internal/` 不依赖 `apps/` 或 `packages/`。

## Next.js apps：Feature-first

```text
apps/{app}/src/
├── app/                       # page/layout/route 等路由文件；仅组合
├── features/
│   └── <feature>/              # 业务视图、calls、hooks、状态、模型、内部测试
├── components/                 # 跨 feature 的真实通用 UI 与 providers
├── lib/                        # app 基础设施与通用工具
├── service/                    # HTTP / RPC / SSE 运行时实例
│   ├── http-client.ts          # client-only
│   ├── http-server.ts          # server-only
│   ├── rpc-client.ts           # client-only
│   ├── rpc-server.ts           # server-only
│   └── sse-client.ts           # 可选，client-only
└── styles/                     # 全局样式
```

- feature 内可包含 `components/`、`model/`、calls、React Query hooks、Zustand store、纯逻辑与测试；业务代码不进入 `src/service/`。
- `src/app/**/page.tsx`、`layout.tsx` 只组合 feature 入口、路由元数据和 Next.js 能力，不定义业务状态、请求 call、可复用视图或业务编排。
- `src/service/` 只创建 HTTP/RPC/SSE 实例。浏览器文件必须 `client-only`，服务端文件必须 `server-only`；hc 通过 `createRpcClient(http, baseUrl)` 复用注入的 HTTP 实例。
- 通过当前公开入口消费能力，不维护旧路径 alias、纯透传 re-export 或 shim。

## Hono app：api

```text
apps/api/src/
├── app.ts                      # Hono 入口，导出 AppType
├── routes/                     # HTTP 解析、schema 校验、响应格式化
├── middleware/                 # 认证、日志、错误处理、CORS
└── lib/                        # DB、缓存、第三方 SDK
```

当前 Hono 业务在 route handler 内闭环；复杂逻辑可在对应 route 目录中拆为纯函数。`AppType` 不进入 package。

## 应用内依赖规则

| 层级 | 可以导入 | 禁止导入 |
|---|---|---|
| `src/app/` | `@/features/*` 公开入口、路由元数据、Next.js 能力、跨 feature UI | feature 内部私有文件、业务状态、业务 call 实现 |
| `src/features/` | `@/service/*` 对应运行时实例、`@/components/*`、`@/lib/*`、共享包 | `@/app/*`、其他 feature 内部私有文件 |
| `src/service/` | HTTP/RPC/SSE 运行时依赖、`server-only` / `client-only` | `@/app/*`、`@/features/*`、业务 UI、hooks、store |
| `src/components/` | `@kkfive/ui`、antd、`@/lib/*` | feature 私有模型或业务 calls |

跨 feature 复用先通过明确公开入口；跨 app 的通用能力才提取到 package。`@/*` 是 app 内别名（`./src/*`），workspace 包一律使用 `@kkfive/<pkg>`。
