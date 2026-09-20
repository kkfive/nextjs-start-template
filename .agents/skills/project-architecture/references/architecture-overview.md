# 架构与目录约定

## 仓库结构

```text
apps/                         # 独立应用，各自 build/deploy，互不依赖
packages/                     # 共享能力，被 apps 消费；保持通用，不引用 app
internal/                     # 工具链配置预设，不含业务运行时
docs/                         # 只描述当前使用方式的项目文档
.agents/                      # AI 辅助开发规范
```

依赖方向由 architecture-policy（FFG01-07）机器强制；规则语义见 `coding-standards/references/layer-dependency.md`（仅修改规则时阅读）。

## Next.js app：Feature-first

```text
apps/{app}/src/
├── app/                       # page/layout/route 等路由文件；仅组合
│   └── api/                   # 轻量 BFF（Route Handlers）
├── features/<feature>/        # 业务视图、calls、hooks、状态、模型、内部测试
├── components/                # 跨 feature 的真实通用 UI 与 providers
├── config/                    # 应用配置
├── lib/                       # app 基础设施与通用工具
├── service/                   # 仅 HTTP/RPC/SSE 运行时实例（http-/rpc-/sse- 固定命名，client-only/server-only 隔离，FFG03 强制）
└── styles/                    # 全局样式
```

- feature 内可含 `components/`、`model/`、calls、React Query hooks、Zustand store、纯逻辑与测试；业务代码不进入 `src/service/`
- `src/service/` 只创建运行时实例；浏览器文件 `client-only`、服务端文件 `server-only`，双实例物理隔离
- `AppType` 由 client/admin 的 service 层 `rpc-*.ts` 以 `import type` 消费，不进入 package

## Hono app：api

```text
apps/api/src/
├── app.ts                      # Hono 入口，导出 AppType
├── routes/                     # zod 校验、HTTP 适配、响应格式化
├── middleware/                 # 认证、日志、错误处理、CORS
└── lib/                        # DB、缓存、第三方 SDK
```

Hono 业务在 route handler 内闭环；复杂纯逻辑在对应 route 目录内拆分，不预设额外业务层。

## 文件放置速查

| 文件类型 | 位置 |
|---|---|
| 页面 / 轻量 BFF | `apps/{app}/src/app/{route}/` |
| feature 业务代码（含 calls/hooks/store/测试） | `apps/{app}/src/features/{feature}/` |
| 跨 feature UI / provider | `apps/{app}/src/components/` |
| HTTP / RPC / SSE 实例 | `apps/{app}/src/service/` |
| app 工具函数 / 基础设施 | `apps/{app}/src/lib/` |
| 跨 app 契约 | `packages/contracts/src/{module}/` |
