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
│   ├── domain-core/          # 业务纯逻辑（Service/Controller/Type/Const，框架无关）
│   ├── http-client/          # HTTP 抽象（HttpService 接口/基础类）
│   ├── utils/                # 纯工具函数（零运行时依赖）
│   └── ui/                   # shadcn 二次封装 + 基础组件（不含 antd）
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

## 三层维度：apps vs packages vs internal

- **`apps/`**：独立应用，各自拥有完整生命周期（dev/build/deploy），app 之间禁止互相依赖
- **`packages/`**：共享能力，被 apps 消费，保持通用性；禁止依赖任何 `apps/`
- **`internal/`**：项目内部工具链配置，不对外发布，不被 `packages/` 依赖；仅装构建工具链

## 共享包职责

| 包 | 职责 | 依赖约束 |
|---|---|---|
| `@kkfive/contracts` | zod-first schema + 共享类型 + http/error 契约 | 仅依赖 zod，零运行时框架依赖 |
| `@kkfive/domain-core` | 业务纯逻辑（Service/Controller/Type/Const） | 禁依赖 React/Next/Hono；依赖 contracts/utils，peer http-client |
| `@kkfive/http-client` | HttpService 接口/基础类 | peer contracts；禁依赖运行环境 |
| `@kkfive/utils` | 纯工具函数 | 零运行时依赖 |
| `@kkfive/ui` | shadcn 二次封装 + 基础组件 | peer react/react-dom；不含 antd |

## 应用内分层（Next.js apps：client / admin）

每个 Next.js app 内部维持四层：

### Domain 适配层（`apps/{app}/domain/`）

各 app 的 `domain/` 是**薄适配层**，不是业务核心：

- **re-export** `@kkfive/domain-core` 的 service/controller/type
- **注入** 该 app 的运行环境（client 注入浏览器 HttpService，admin 注入服务端 HttpService）
- **补充** 运行环境专属能力（Next.js apps 的 React Query hooks；admin 可能 SSR 直取不需要 hooks）

```typescript
// apps/client/domain/example/index.ts — 注入浏览器实例 + React Query 适配
export * from '@kkfive/domain-core/example'   // re-export 共享包
export { useExample } from './hooks'          // app 专属：useQuery 包装
```

### 基础设施（`apps/{app}/src/lib/`、`apps/{app}/src/service/`）

- `src/service/`：HTTP 实例注入（`index.client.ts` / `index.server.ts` / `index.sse.ts`），实例由该 app 专属，不进共享包
- `src/lib/`：工具函数、错误处理

### UI（`apps/{app}/src/components/`）

- `ui/`：基础 UI 入口，底层来自 `@kkfive/ui`，按需扩展
- `common/`：通用功能组件，与业务相关但不依赖特定 domain
- `domain/`：领域 UI 组件，结合 Domain 适配层与 UI

```typescript
// apps/client/src/components/domain/material/material-document-viewer.tsx - 领域 UI
import { Controller } from '@domain/material'                // 该 app 的 Domain 适配层
import { PdfViewer } from '@/components/common/pdf-viewer'
import { Button } from '@/components/ui/button'

export function MaterialDocumentViewer() {
  // 结合 Material 领域逻辑与通用组件
}
```

### 路由（`apps/{app}/src/app/`）

- **职责**: Next.js App Router 页面和路由
- **内容**: 仅 page.tsx、layout.tsx 和路由相关文件
- **限制**: 禁止可复用组件（移至 `src/components/`）

## 应用内依赖规则（Next.js apps）

| 层级 | 可以导入 | 禁止导入 |
|------|----------|----------|
| `domain/` | `@kkfive/domain-core`、`@kkfive/contracts`、`@kkfive/http-client`、`@/service/*`（注入实例）、`@tanstack/react-query`（仅 hooks） | `@/components/*`、`@/app/*`、`@/hooks/*`、`@/store/*` |
| `src/components/domain/` | `@domain/*`、`@kkfive/ui`、`@/components/ui/*`、`@/components/common/*`、`@/lib/*` | 第三方 UI 库直接导入（antd 除外，app 内自治） |
| `src/components/common/` | `@kkfive/ui`、`@/components/ui/*`、`@/lib/*`、外部库 | `@domain/*`、业务逻辑 |
| `src/components/ui/` | `@kkfive/ui`、第三方 UI 库（shadcn 体系） | `@domain/*`、`@/components/common/*`、业务逻辑 |
| `src/app/` | `@domain/*`、`@kkfive/*`、`@/components/*`、`@/lib/*`、`@/hooks/*`、`@/store/*` | 第三方 UI 库直接导入 |

> `@/*`、`@domain/*` 别名在各 app 的 `tsconfig.json` 内定义（`@/* → ./src/*`、`@domain/* → ./domain/*`）。跨包引用统一走 `@kkfive/<pkg>` workspace 协议。

**依赖流向**：

```
apps/client, apps/admin (Next.js):
  页面 → 领域 UI 组件 → domain 适配层 → @kkfive/domain-core → @kkfive/contracts + @kkfive/utils
    ↓         ↓              ↓（注入）
  通用组件 ←─────┘      @kkfive/http-client（实例由 app 注入）
    ↓
  @kkfive/ui ←───────────┘

apps/api (Hono, 同进程直调):
  路由 → domain 适配层 → @kkfive/domain-core → @kkfive/contracts + @kkfive/utils
    ↓                       （无 HttpService 注入）
  中间件 → lib
```

## 跨包依赖规则

| 层 | 可以依赖 | 禁止依赖 |
|---|---|---|
| `apps/*` | `packages/*`、`internal/*`、外部 npm 包 | 其他 `apps/*` |
| `packages/contracts` | zod | React、Hono、Next.js、任何 `apps/*` |
| `packages/domain-core` | `@kkfive/contracts`、`@kkfive/utils`、`@kkfive/http-client`(peer) | React、Hono、Next.js、任何 `apps/*`、`@kkfive/ui` |
| `packages/http-client` | `@kkfive/contracts`(peer) | React、Hono、Next.js、任何 `apps/*`、`@kkfive/ui`、`@kkfive/domain-core` |
| `packages/utils` | 零运行时依赖 | 任何框架、任何 `apps/*`、`@kkfive/contracts` |
| `packages/ui` | React(peer)、shadcn/Radix、Tailwind | 任何 `apps/*`、antd |
| `internal/*` | 构建工具链 | `apps/*`、`packages/*`、运行时框架 |

## 路径别名

各 app 的 `tsconfig.json` 继承 `@kkfive/tsconfig/{nextjs|hono}.json`，并定义自己的路径别名：

```json
{
  "extends": "@kkfive/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@domain/*": ["./domain/*"]
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
