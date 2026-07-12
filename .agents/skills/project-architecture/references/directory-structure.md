# 目录约定

## 仓库根目录

```text
apps/                         # 独立应用
packages/                     # 共享能力
internal/                     # 工具链配置预设
scripts/                      # 可执行脚本入口
docs/                         # 仓库级文档
.agents/                      # AI 辅助开发规范
```

## Next.js app

```text
apps/{app}/src/
├── app/                       # Next.js 路由；page/layout 仅组合 feature 入口
│   └── api/                   # 轻量 BFF（Route Handlers）
├── features/<feature>/        # 视图、calls、hooks、状态、模型、内部测试
├── components/                # 跨 feature 的 UI、common、providers
├── config/                    # 应用配置
├── lib/                       # app 基础设施与工具
├── service/                   # 仅 HTTP/RPC/SSE 运行时实例
│   ├── http-client.ts         # client-only
│   ├── http-server.ts         # server-only
│   ├── rpc-client.ts          # client-only
│   ├── rpc-server.ts          # server-only
│   └── sse-client.ts          # 可选，client-only
└── styles/                    # 全局样式
```

## Hono app

```text
apps/api/src/
├── app.ts                      # Hono 入口（导出 AppType）
├── routes/                     # zod 校验、HTTP 适配、响应格式化
├── features/<feature>/         # 业务编排及其私有逻辑
├── middleware/                 # 认证、日志、错误处理、CORS
└── lib/                        # DB、缓存、第三方 SDK
```

## 文件放置规则

| 文件类型 | 位置 | 示例 |
|---|---|---|
| 页面 | `apps/{app}/src/app/{route}/page.tsx` | 组合 `@/features/...` 入口 |
| 轻量 BFF | `apps/{app}/src/app/api/{endpoint}/route.ts` | `apps/client/src/app/api/revalidate/route.ts` |
| feature 业务代码 | `apps/{app}/src/features/{feature}/` | `apps/client/src/features/material/` |
| 跨 feature UI | `apps/{app}/src/components/` | `apps/client/src/components/common/pdf-viewer/` |
| 自有 API 共享 calls | `packages/rpc/src/{module}/calls.ts` | `packages/rpc/src/example-request/calls.ts` |
| HTTP / RPC / SSE 实例 | `apps/{app}/src/service/` | `apps/client/src/service/rpc-client.ts` |
| app 工具函数 | `apps/{app}/src/lib/` | `apps/client/src/lib/utils.ts` |
| feature 测试 | 与 feature 源文件同目录 | `features/material/calls.test.ts` |
