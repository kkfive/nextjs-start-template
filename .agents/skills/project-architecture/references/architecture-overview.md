# 架构文档

本文档描述 monorepo 整体架构和模块组织。

## 仓库结构

```
├── apps/                     # 独立应用（各自 build/deploy，互不依赖）
│   ├── client/               # Next.js 客户端（浏览器）
│   ├── admin/                # Next.js 管理后台（SSR）
│   └── api/                  # Hono API 服务（后端）
├── packages/                 # 共享包（被 apps 消费，不独立部署）
│   ├── contracts/            # API 契约（zod-first schema + 类型 + http/error 契约）
│   ├── http-client/          # HTTP 抽象（HttpService + interceptor + BusinessError + SSE）
│   ├── rpc/                  # 类型化 RPC（hc 工厂 + unwrapData + 自有 api 共享 calls）
│   ├── utils/                # 纯工具函数（common/dom 物理隔离，零运行时依赖）
│   └── ui/                   # shadcn 二次封装 + 基础控件（./components）+ 重型渲染（./widgets）
├── internal/                 # 工具链配置预设（不对外发布）
│   ├── tsconfig/             # TypeScript 预设
│   ├── lint-config/          # ESLint 预设
│   ├── tailwind-config/      # Tailwind 预设
│   ├── nextjs-config/        # Next.js 预设
│   └── node-utils/           # Node 工具函数库（仅开发期）
├── scripts/                  # 可执行脚本入口
├── docs/                     # 仓库级文档（ADR、架构说明、全局约定）
└── .agents/                  # AI 辅助开发规范（根级，全局生效）
```

> 已废弃包：`domain-core`（不存在）、`render-infra`（并入 `ui/widgets`）、`biz`（业务包模式撤销，前端业务在 app 内）。已废弃模式：Controller 模式、同进程直调。

## 三层维度：apps vs packages vs internal

- **`apps/`**：独立应用，各自拥有完整生命周期（dev/build/deploy），app 之间禁止互相依赖
- **`packages/`**：共享能力，被 apps 消费，保持通用性；禁止依赖任何 `apps/`（唯一例外：`rpc` 经 type-only import 引 `apps/api` 的 `AppType`）
- **`internal/`**：项目内部工具链配置，不对外发布，不被 `packages/` 依赖；仅装构建工具链

## 共享包职责

| 包 | 职责 | 依赖约束 |
|---|---|---|
| `@kkfive/contracts` | zod-first schema + 共享类型 + http/error 契约，全栈契约源 | 仅依赖 zod，零运行时框架依赖 |
| `@kkfive/http-client` | HttpService 接口/基础类 + interceptor 机制 + BusinessError + SSE | peer contracts；底层 fetch；不绑业务；不知 envelope |
| `@kkfive/rpc` | 类型化 RPC（`createRpcClient` 工厂 + `unwrapData` + 自有 api 共享 calls） | 依赖 contracts + hono；peer http-client；type-only 引 api 的 `AppType`；**不含 react-query/react** |
| `@kkfive/utils` | 纯工具函数 | 零运行时依赖；`common`（多端）/ `dom`（浏览器）物理隔离 |
| `@kkfive/ui` | 基础 UI 控件（`./components`）+ 重型渲染（`./widgets` 子入口） | peer react/react-dom；不含 antd；默认入口不 re-export widgets |

## 应用内分层（Next.js apps：client / admin）

每个 Next.js app 内部维持四层：

### 适配层（`apps/{app}/src/service/`）

各 app 的 `src/service/` 是**运行环境适配层**，创建 HTTP 实例和 hc RPC 客户端，不承载业务逻辑：

- **双实例物理隔离**：浏览器侧（`http-client.ts` + `rpc-client.ts`，`import 'client-only'`）与服务端侧（`http-server.ts` + `rpc-server.ts`，`import 'server-only'`），由 `server-only`/`client-only` 包在文件级强制
- **hc 注入实例**：`createRpcClient(httpClient, baseUrl)` 复用 HttpService 实例的拦截器链（retry / hooks / 401 / 错误归一化），hc 不再造实例
- **app 专属 calls**：第三方 API 调用（非自有 api）放此层；自有 api 共享 calls 进 `@kkfive/rpc`
- **SSE 实例**（可选）：`index.sse.ts`，流式不走 hc（无流式语义）

```typescript
// apps/client/src/service/rpc-client.ts — 浏览器 hc RPC 客户端
import 'client-only'
import { createRpcClient } from '@kkfive/rpc'
import { httpClient } from './http-client'
export const rpcClient = createRpcClient(httpClient, '/api')

// apps/client/src/service/rpc-server.ts — 服务端 hc RPC 客户端（SSR）
import 'server-only'
import { createRpcClient } from '@kkfive/rpc'
import { httpServer } from './http-server'
export const rpcServer = createRpcClient(httpServer, process.env.API_BASE_URL)
```

### Hooks 与缓存（`apps/{app}/src/hooks/`）

各 app 自写 React Query hooks（缓存策略自治），调用 `@kkfive/rpc` 的纯调用函数：

```typescript
// apps/client/src/hooks/use-example.ts — React Query 包装
import { useQuery } from '@tanstack/react-query'
import { fetchExample } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'
export function useExample() {
  return useQuery({ queryKey: ['example'], queryFn: () => fetchExample(rpcClient) })
}
```

### 业务组件（`apps/{app}/src/components/`）

- `ui/`：基础 UI 入口，底层来自 `@kkfive/ui`
- `common/`：通用功能组件，与业务相关但不依赖特定领域
- 业务组件直接使用 antd 独有能力（Form/Table/Upload 等），基础控件优先 `@kkfive/ui`

### 路由（`apps/{app}/src/app/`）

- **职责**: Next.js App Router 页面和路由
- **内容**: 仅 page.tsx、layout.tsx 和路由相关文件
- **限制**: 禁止可复用组件（移至 `src/components/`）

## 应用内依赖规则（Next.js apps）

| 层级 | 可以导入 | 禁止导入 |
|------|----------|----------|
| `src/service/` | `@kkfive/http-client`、`@kkfive/rpc`、`@kkfive/contracts`、`@kkfive/utils`、`server-only`/`client-only` | `@/components/*`、`@/app/*`、`@/hooks/*` |
| `src/hooks/` | `@kkfive/rpc`（calls）、`@/service/*`（rpc 客户端实例）、`@tanstack/react-query` | `@/components/*`（避免循环）、`@/app/*` |
| `src/components/` | `@kkfive/ui`、`@kkfive/rpc`（calls）、`@/hooks/*`、`@kkfive/ui/components/*`、antd、`@/lib/*` | `@/service/rpc-server`（client 组件禁引服务端实例） |
| `src/app/` | `@kkfive/*`、`@/components/*`、`@/hooks/*`、`@/lib/*`、`@/service/*`（按 server/client 边界） | 第三方 UI 库直接导入（antd 除外，app 内自治） |

> `@/*` 别名在各 app 的 `tsconfig.json` 内定义（`@/* → ./src/*`）。跨包引用统一走 `@kkfive/<pkg>` workspace 协议。

**依赖流向**：

```
apps/client, apps/admin (Next.js):
  页面 → src/components（业务组件）
    ↓                        ↓
  src/hooks（RQ 缓存）    @kkfive/ui ← @kkfive/ui/widgets（重型渲染）
    ↓
  src/service（适配层：rpc-client / rpc-server，双实例 server-only/client-only 隔离）
    ↓                        ↓
  @kkfive/rpc（calls）    @kkfive/http-client（HttpService + interceptor + SSE）
    ↓                        ↓（hc 注入 HttpService 实例，复用拦截器链）
  apps/api（Hono，AppType type-only）    @kkfive/contracts（zod + 类型 + 错误码）
```

```
apps/api (Hono，真实后端):
  路由（zod 校验 + 业务编排）→ src/lib（DB/缓存/第三方 SDK）
    ↓
  中间件（认证/日志/CORS/错误）→ src/app.ts（导出 export type AppType）
```

## 跨包依赖规则

| 层 | 可以依赖 | 禁止依赖 |
|---|---|---|
| `apps/*` | `packages/*`、`internal/*`、外部 npm 包 | 其他 `apps/*` |
| `packages/contracts` | zod | React、Hono、Next.js、任何 `apps/*` |
| `packages/rpc` | `@kkfive/contracts`、`@kkfive/http-client`(peer)、`hono`、`apps/api` 的 `AppType`(type-only) | React、Next.js、`@kkfive/ui`、`@kkfive/utils`、react-query、任何运行时 `apps/*` |
| `packages/http-client` | `@kkfive/contracts`(peer) | React、Hono、Next.js、任何 `apps/*`、`@kkfive/ui`、`@kkfive/rpc` |
| `packages/utils` | 零运行时依赖 | 任何框架、任何 `apps/*`、`@kkfive/contracts` |
| `packages/ui` | React(peer)、shadcn/Radix、Tailwind | 任何 `apps/*`、antd、`@kkfive/contracts`/`@kkfive/rpc` |
| `internal/*` | 构建工具链 | `apps/*`、`packages/*`、运行时框架 |

> **第三方类型 zod-first**：第三方 API 的类型在 `@kkfive/contracts` 定义 zod schema → `z.infer` 推导类型 → 调用方 `.parse()` 校验外部响应（响应不可信）。

## 路径别名

各 app 的 `tsconfig.json` 继承 `@kkfive/tsconfig/{nextjs|hono}.json`，并定义自己的路径别名：

```json
{
  "extends": "@kkfive/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> `@kkfive/*` 不走 tsconfig paths，走 workspace 协议（pnpm 自动解析到 `packages/*`）。tsconfig paths 仅用于 app 内部别名。

## 测试策略

- **单元测试**: 纯函数、Schema、工具函数（覆盖 `packages/*` 和各 app `src/lib/`）
- **组件测试**: React 组件 + Testing Library
- **集成测试**: API 路由、数据获取
- **Mock**: MSW 处理 HTTP 请求

详见各 app 的 `src/__tests__/` 测试工具和 mock 配置。
