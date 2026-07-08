# 常见问题 (FAQ)

> 本文档只收录"为什么这样设计"与高频使用问题。具体编码规范见 [AGENTS.md](../AGENTS.md) 与 `.agents/skills/`。

## HTTP 请求层

### 如何适配后端特定的响应信封结构？

项目默认响应格式（成功/错误 envelope）的类型定义在 `packages/http-client`（Phase 2 后）或 `apps/client/src/lib/request/type.ts`（Phase 1）。适配不同后端格式时，修改 envelope 类型与 Controller 中的转换逻辑，不要在 HttpService 层全局转换（会影响不需要转换的接口）。

### `src/service/` 下的 `.base.ts` / `.client.ts` / `.server.ts` 该用哪个？

| 文件 | 场景 | 环境变量 |
| --- | --- | --- |
| `index.base.ts` | 通用/测试（无拦截器） | 无 |
| `index.client.ts` | 客户端组件 (`'use client'`) | `NEXT_PUBLIC_API_URL` |
| `index.server.ts` | 服务端组件 (RSC)、API 路由 | `API_BASE_URL` |

- `.server.ts` 含 Cookie/Token 注入等服务端专用拦截器
- `.client.ts` 含客户端日志、401 跳转等客户端专用拦截器
- HttpService 实例由各 app 的 `src/service/` 创建并注入到 domain-core 的 Controller（实例是 app 专属，不进共享包）

### 为什么 Controller 采用 `getData(http, ...)` 显式注入模式？

1. **可测试性**：测试时注入 Mock 实例，无需 mock 模块
2. **跨环境复用**：同一 Controller 可在客户端（注入 httpClient）和服务端（注入 httpServer）使用；`apps/api`（Hono）同进程直调，不经 HttpService
3. **解耦**：`@kkfive/domain-core` 不依赖具体实例，保持框架无关

## 数据类型

### 分页/通用工具类型放哪？

跨 app 共享的工具类型（`Pagination`、`PaginatedResponse<T>`、`Nullable<T>`、`ExternalData<T>` 等）在 `packages/contracts/types/`。模块专属类型在各 domain 模块的 `type.ts`。

### 后端返回 `snake_case` 而前端用 `camelCase` 怎么处理？

在 Controller 层用 `es-toolkit` 的 `toCamelCaseKeys` 转换，不要在 HttpService 层全局转换。

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

使用 **Iconify + Tailwind CSS** 方案，禁止直接安装 `lucide-react` 等图标库。从各 app 的 `@/components/ui/icon` 统一入口导入。图标查询：[Iconify 图标库](https://icon-sets.iconify.design/)。详见 `.agents/skills/coding-standards/references/icon-usage.md`。
