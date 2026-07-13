# 常见问题 (FAQ)

> 本文档只收录"为什么这样设计"与高频使用问题。具体编码规范见 [AGENTS.md](../AGENTS.md) 与 `.agents/skills/`。

## HTTP 请求层

### 如何适配后端特定的响应信封结构？

项目默认响应 envelope 定义在 `packages/contracts/src/`，`packages/http-client` 只负责通用传输。适配不同后端格式时，在所属 feature 或 API route 中转换，不要污染 HttpService 全局行为。

### `src/service/` 下的运行时实例该如何命名和使用？

| 文件 | 场景 | 环境变量 |
| --- | --- | --- |
| `http-client.ts` / `rpc-client.ts` | 客户端组件 (`'use client'`) | `NEXT_PUBLIC_API_URL` |
| `http-server.ts` / `rpc-server.ts` | 服务端组件 (RSC)、API 路由 | `API_BASE_URL` |
| `sse-client.ts`（可选） | 浏览器流式请求 | `NEXT_PUBLIC_API_URL` |

- `*-server.ts` 含 Cookie/Token 注入等服务端专用拦截器，并以 `server-only` 隔离
- `*-client.ts` 含客户端日志、401 跳转等客户端专用拦截器，并以 `client-only` 隔离
- `src/service/` 只创建 app 专属的 HTTP/RPC/SSE 实例；业务 calls、hooks、状态和视图归入 `src/features/<feature>/`

### 为什么运行时实例通过参数注入给 feature calls？

1. **可测试性**：测试时注入 Mock 实例，无需 mock 模块
2. **跨环境复用**：同一 feature call 可在客户端（注入 httpClient）和服务端（注入 httpServer）使用
3. **边界清晰**：运行时实例不承载业务逻辑，feature 不依赖全局单例

## 数据类型

### 分页/通用工具类型放哪？

跨 app 共享的 schema 与类型放 `packages/contracts/src/`。模块专属类型放所属 `src/features/<feature>/` 的 `type.ts`。

### 后端返回 `snake_case` 而前端用 `camelCase` 怎么处理？

在所属 feature 或 API 业务模块用 `es-toolkit` 的 `toCamelCaseKeys` 转换，不要在 HttpService 层全局转换。

## 状态管理

### React Query 与 Zustand 的职责划分？

- **React Query**：服务端状态（API 数据）—— 用户列表、文章详情
- **Zustand**：客户端状态（UI 状态）—— Sidebar 开关、主题切换

判断标准：数据来自 API → React Query；数据仅存在于前端 → Zustand。

## 环境变量

| 文件 | 用途 | 优先级 |
| --- | --- | --- |
| `.env` | 默认值（所有环境） | 最低 |
| `.env.local` | 本地开发（不提交 Git） | 高 |
| `.env.development` | 开发环境 | 中 |
| `.env.production` | 生产环境 | 中 |

关键变量：服务端用 `API_BASE_URL`（不暴露浏览器），客户端用 `NEXT_PUBLIC_API_URL`（必须 NEXT_PUBLIC_ 前缀）。类型安全校验在 `apps/client/src/config/env.ts`（用 `@t3-oss/env-nextjs`）。

## 图标

图标统一从 `@kkfive/ui/components/icon` 导入；不要在业务 app 重复安装图标库。图标查询：[Iconify 图标库](https://icon-sets.iconify.design/)。详见 `.agents/skills/coding-standards/references/icon-usage.md`。
