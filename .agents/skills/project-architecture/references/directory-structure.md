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
├── domain/                   # Domain 适配层
│   └── {module}/             # re-export @kkfive/domain-core + 注入 HttpService + 可选 React Query hooks
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── {route}/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── api/              # 轻量 BFF（Route Handlers）
│   ├── components/
│   │   ├── ui/               # 基础 UI 入口（来自 @kkfive/ui）
│   │   ├── common/           # 通用功能组件
│   │   ├── domain/           # 领域 UI 组件
│   │   │   └── {module}/
│   │   └── providers.tsx     # 全局 Providers
│   ├── lib/                  # 工具库（request/、errors/、utils）
│   ├── hooks/                # React Hooks
│   ├── store/                # Zustand stores
│   ├── config/               # 应用配置
│   ├── service/              # HTTP 实例注入（index.client/server/sse）
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
| `common/` | 通用功能组件 | 可复用的功能性组件，与业务相关但不依赖特定 domain | PdfViewer, ImageCropper |
| `domain/` | 领域 UI 组件 | 结合特定业务逻辑，依赖该 app 的 domain 适配层 | MaterialDocumentViewer, HitokotoCard |

## 应用目录（Hono app：api）

```
apps/api/
├── domain/                   # Domain 适配层（re-export @kkfive/domain-core，无 hooks、无 HttpService）
├── src/
│   ├── routes/               # Hono 路由（HTTP 协议适配层）
│   ├── middleware/           # Hono 中间件（认证、日志、错误处理、CORS）
│   ├── lib/                  # 服务端基础设施（DB 客户端、缓存、第三方 SDK）
│   └── app.ts                # Hono app 入口
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

`packages/domain-core/` 内部按业务模块组织：

```
packages/domain-core/src/
└── {module}/                 # 业务模块（框架无关纯逻辑）
    ├── index.ts              # 模块公开入口
    ├── service.ts            # 第一参数注入 HttpService
    ├── controller.ts         # 业务编排
    ├── type.ts               # 从 @kkfive/contracts 扩展的业务专属类型
    └── const/
        └── api.ts            # API 端点常量
```

## Domain 适配层（`apps/{app}/domain/{module}/`）

```
apps/{app}/domain/{module}/
├── index.ts                  # re-export @kkfive/domain-core/{module} + app 专属导出
└── hooks.ts                  # Next.js apps 专属：React Query 包装（api 无此文件）
```

**规则**：
- 适配层文件精简，核心逻辑全在 `@kkfive/domain-core`
- `_shared/` 前缀表示跨模块共享的内部代码
- 每个模块的 `index.ts` 是唯一出口

## 文件放置规则

| 文件类型 | 位置 | 示例 |
|----------|------|------|
| 页面组件 | `apps/{app}/src/app/{route}/page.tsx` | `apps/client/src/app/demo/page.tsx` |
| 轻量 BFF 路由 | `apps/{app}/src/app/api/{endpoint}/route.ts` | `apps/client/src/app/api/revalidate/route.ts` |
| 基础 UI | `apps/{app}/src/components/ui/{component}/` | `apps/client/src/components/ui/button/` |
| 通用功能组件 | `apps/{app}/src/components/common/{component}/` | `apps/client/src/components/common/pdf-viewer/` |
| 领域 UI | `apps/{app}/src/components/domain/{module}/` | `apps/client/src/components/domain/material/` |
| Domain 纯逻辑 | `packages/domain-core/src/{module}/` | `packages/domain-core/src/material/` |
| Domain 适配层 | `apps/{app}/domain/{module}/` | `apps/client/domain/material/` |
| 工具函数（通用） | `packages/utils/src/` | `packages/utils/src/string.ts` |
| 工具函数（app 专属） | `apps/{app}/src/lib/` | `apps/client/src/lib/utils.ts` |
| React Hook | `apps/{app}/src/hooks/use-{name}.ts` | `apps/client/src/hooks/use-mobile.ts` |
| Zustand Store | `apps/{app}/src/store/{name}-store.ts` | `apps/client/src/store/mouse-store.ts` |
| 测试文件 | 与源文件同目录 `{name}.test.ts` | `apps/client/src/lib/utils.test.ts` |
