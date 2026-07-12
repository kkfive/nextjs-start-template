# App 结构与配置继承详解

## Next.js app 目录结构

```text
apps/{app}/src/
├── app/                       # Next.js 路由；仅组合 feature 入口
├── features/<feature>/        # 视图、calls、hooks、状态、模型、内部测试
├── components/                # 跨 feature UI 与 providers
├── config/                    # 应用配置
├── lib/                       # 工具函数、错误处理和基础设施
└── service/                   # 仅 HTTP/RPC/SSE 运行时实例
    ├── http-client.ts         # client-only
    ├── http-server.ts         # server-only
    ├── rpc-client.ts          # client-only
    ├── rpc-server.ts          # server-only
    └── sse-client.ts          # 可选，client-only
```

## Hono app 目录结构

```text
apps/api/src/
├── app.ts                      # Hono 入口，导出 AppType
├── routes/                     # zod 校验、HTTP 适配、响应格式化
├── features/<feature>/         # 业务编排及其私有逻辑
├── middleware/                 # 中间件（认证/日志/CORS/错误）
└── lib/                        # 服务端基础设施（DB/缓存/第三方 SDK）
```

## tsconfig.json

```json
{
  "extends": "@kkfive/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`@/*` 只用于 app 内路径；workspace 包通过 `@kkfive/<pkg>` 与 `workspace:*` 引用。不得为已迁移目录保留路径 alias。

## 运行时实例

`src/service/` 只创建 app 专属 HTTP/RPC/SSE 实例。浏览器端文件使用 `client-only`，服务端文件使用 `server-only`；`createRpcClient(http, baseUrl)` 接收现有 HTTP 实例。业务 calls、hooks、状态和视图归入 `src/features/<feature>/`。
