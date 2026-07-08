# Monorepo 架构重构

## 背景

本项目是一个 Next.js 启动模板，开发者基于本项目进行业务开发。当前是单应用架构，所有代码位于同一 `src/` + `domain/` 下。随着真实业务场景的复杂度增长，开发者通常需要同时维护多个应用（客户端、管理后台、API 服务），并共享类型定义、UI 组件和工具配置。

单应用架构无法满足以下需求：

1. 多应用共享类型定义和 schema（例如 API 请求/响应的 zod schema，客户端和服务端都需要）
2. 多应用共享 UI 组件（管理后台和客户端可能复用基础组件）
3. 各应用独立部署、独立构建，但共享开发规范
4. 开发者可以在模板基础上快速新建应用

## 决策

采用 **pnpm workspace + Turborepo** 的 monorepo 架构。

### 目录结构

```
monorepo/
├── apps/                          # 独立应用（可独立构建、部署）
│   ├── client/                    # Next.js 客户端（面向终端用户）
│   ├── admin/                     # Next.js 管理后台（面向内部用户）
│   └── api/                       # Hono API 服务（核心业务接口）
│
├── packages/                      # 共享包（被 apps 消费，不独立部署）
│   ├── contracts/                 # API 契约（zod-first schema + 共享类型 + http/error 契约）
│   ├── domain-core/               # 业务纯逻辑（Service / Controller / Type / Const，框架无关）
│   ├── http-client/               # HTTP 抽象（HttpService 接口/基础类，各 app 注入实例）
│   ├── utils/                     # 纯工具函数（零运行时依赖）
│   └── ui/                        # shadcn 二次封装 + 自实现基础组件（不含 antd）
│
├── internal/                      # 内部工具链配置（项目专属，不对外发布）
│   ├── tsconfig/                  # TypeScript 配置预设
│   ├── lint-config/               # ESLint 配置预设
│   ├── tailwind-config/           # Tailwind CSS 配置预设
│   ├── nextjs-config/             # Next.js 配置预设（client/admin 共享）
│   └── node-utils/                # Node.js 工具函数库（仅开发期，被 scripts 复用）
│
├── scripts/                       # 可执行脚本入口（verify-conventions 等，调用 @kkfive/node-utils）
│
├── docs/                          # 仓库级文档（ADR、架构说明、全局约定）
│   ├── architecture.md            # 仓库整体架构说明
│   ├── decisions/                 # 架构决策记录
│   └── conventions/               # 全局编码约定
│
├── .agents/                       # AI 辅助开发规范（根级，全局生效）
│   ├── rules/                     # 编码规则（按文件路径条件加载）
│   └── skills/                    # 任务引导流程
├── AGENTS.md                      # 根级 AI 入口（monorepo 全局规则）
│
├── turbo.json                     # Turborepo 任务编排
├── pnpm-workspace.yaml            # pnpm workspace 定义
├── mise.toml                      # 工具链版本管理
└── package.json                   # 根 package.json（仅放共享工具依赖）
```

### 分层原则

monorepo 分为三个维度：**应用**、**共享包**和**内部工具链**。

#### 三层结构：apps vs packages vs internal

```
apps/         独立应用，各自拥有完整生命周期（dev/build/deploy）
packages/     共享能力，被 apps 消费，保持通用性
internal/     项目内部工具链配置，不对外发布，不被 packages 依赖
```

**硬性约束：**

- packages 禁止依赖 apps
- apps 之间禁止互相依赖
- `packages/contracts` 和 `packages/utils` 零运行时依赖（不引入 React、Hono 等框架；contracts 仅依赖 zod）
- `packages/domain-core` 禁止依赖 React / Next.js / Hono（框架无关纯逻辑，hooks 留在各 app 适配层）
- `packages/http-client` 禁止依赖具体运行环境（仅定义 HttpService 接口/基础类，实例由各 app 注入）
- `packages/ui` 仅含 shadcn 二次封装与自实现基础组件，**不含 antd**；antd 由各 app 按需自行安装
- `packages/domain-core` 可依赖 `contracts` / `utils` / `http-client`；`http-client` 仅可依赖 `contracts`

#### 应用内：Domain / 基础设施 / UI / 路由

每个 app 内部仍保持原有的四层架构。domain 层从根目录移入各 app 内部，但**降级为薄适配层**——核心逻辑下沉到 `@kkfive/domain-core` 共享包，各 app 的 `domain/` 只负责：

- re-export `@kkfive/domain-core` 的 service/controller/type
- 注入该 app 的运行环境（client/admin 注入 HttpService 实例；api 同进程直调）
- 添加运行环境专属适配（Next.js apps 的 React Query hooks；api 无 hooks）

```
apps/{app}/
├── domain/              # Domain 适配层（re-export @kkfive/domain-core + 环境适配）
├── src/
│   ├── app/             # 路由层（Next.js App Router / Hono Router）
│   ├── components/      # UI 组件（该 app 专属）
│   ├── lib/             # 基础设施（HTTP 实例注入、工具函数）
│   ├── service/         # 请求实例（client/server/SSE 分层）
│   ├── hooks/           # React Hooks（Next.js apps）
│   └── store/           # 状态管理（该 app 专属）
├── public/              # 静态资源（Next.js apps）
├── next.config.ts       # 框架配置（Next.js apps）
└── package.json
```

### Packages 通用性原则

所有 `packages/*` 必须保持通用性，不绑定特定业务场景：

- **只抽离真正可复用的内容**：如果一个组件、函数或类型只服务于特定业务场景，它应该留在对应 app 内部，而不是放入 packages
- **判断标准**：问"如果换一个新项目，这个东西还能直接用吗？" — 如果不能，它不够通用
- **宁可晚抽离**：先在 app 内部实现，等出现第二个消费方时再提取为 package

### 各包职责

#### `packages/contracts` — API 契约

消费方：所有 apps、`packages/domain-core`。

```
packages/contracts/
├── schemas/              # zod-first，线上传输的数据形状
│   └── user.ts           # export const UserSchema = z.object({...})
│                          # export type User = z.infer<typeof UserSchema>
├── types/                # 仅 zod 表达不了的（泛型工具类型）
│   └── common.ts         # Nullable<T>, Optional<T>, Pagination<T>, ExternalData<T>, PaginatedResponse<T>
├── errors/               # 错误码枚举 + 响应形状（数据部分，非错误类）
│   └── code.ts           # export const ErrorCodeSchema = z.enum([...])
│                          # export type ErrorCode = z.infer<typeof ErrorCodeSchema>
│                          # export const ErrorResponseSchema = z.object({...})
└── package.json          # dependencies: { zod } — 仅纯逻辑库
```

**关键原则：**

- 零运行时依赖：仅依赖 zod，不引入 React、Hono 等框架
- 可被任何环境消费：Node.js、浏览器、Edge Runtime
- 定义 API 契约：接口端用它校验请求和格式化响应，客户端用它做表单验证和类型推断
- 只放跨 app 共享的 schema 和类型；app 专属类型留在各 app 的 domain 适配层

**zod-first 类型策略（三条内部规则）：**

1. **能 zod 就 zod**：所有线上 request/response 用 zod schema，类型一律 `z.infer` 推导，单一真源防漂移
2. **手写类型仅限 zod 盲区**：泛型工具类型（`Nullable<T>`、`Pagination<T>`）、行为类、非传输类型——这三类放 `types/` 或 `errors/`，是受控的例外
3. **错误类（如 `BusinessError`）不放这**：它有 throw/instanceof 行为，属于 `domain-core` 或 `http-client`。contracts 只放它的*响应数据形状*（`ErrorResponseSchema`）

**与 domain 的关系：**

```typescript
// packages/contracts/schemas/user.ts
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
})
export type User = z.infer<typeof UserSchema>

// apps/client/domain/user/type.ts — 扩展业务专属类型
import type { User } from '@kkfive/contracts'
export type UserWithPosts = User & { posts: Post[] }

// apps/api/domain/user/service.ts — 用 schema 校验请求
import { UserSchema } from '@kkfive/contracts'
const parsed = UserSchema.safeParse(requestBody)
```

#### `packages/domain-core` — 业务纯逻辑

消费方：所有 apps（client / admin / api 的 domain 适配层）。

```
packages/domain-core/
└── src/
    └── example/             # 业务模块（模块结构与 app 内 domain 一致）
        ├── service.ts       # 第一参数注入 HttpService 实例（框架无关）
        ├── controller.ts    # 业务编排
        ├── type.ts          # 从 @kkfive/contracts 扩展的业务专属类型
        ├── const/
        │   └── api.ts       # API 端点常量
        └── index.ts         # 模块公开入口
# package.json: dependencies: { @kkfive/contracts, @kkfive/utils }
#              peerDependencies: { @kkfive/http-client }
```

**关键原则：**

- **只放框架无关的纯逻辑**：service / controller / type / const。`service.ts` 第一参数注入 `HttpService` 实例，由各 app 决定注入浏览器实例还是服务端实例
- **禁止 hooks**：不依赖 `@tanstack/react-query`，不依赖任何 React API。React Query 适配（`useQuery` 包装）留在各 app 的 domain 适配层
- **禁止依赖运行环境**：不引入 React / Next.js / Hono。`apps/api`（Hono）同进程直调 controller，不经过 HttpService
- 业务模块结构稳定：core 提供纯逻辑，apps/* 各自薄包装，避免 service/controller 跨 app 重复实现

**各 app 的 domain 适配层模式：**

```typescript
// apps/client/domain/example/index.ts — Next.js client：React Query 适配
export * from '@kkfive/domain-core/example'   // re-export service/controller/type
export { useExample } from './hooks'          // app 专属：useQuery 包装

// apps/admin/domain/example/index.ts — Next.js admin（SSR）：按需直取
export * from '@kkfive/domain-core/example'
// admin 常以 SSR 取数，可能不需要 hooks

// apps/api/domain/example/index.ts — Hono：route 直接调 controller
export * from '@kkfive/domain-core/example'
// api 同进程直调，无需 HttpService
```

#### `packages/http-client` — HTTP 抽象

消费方：所有 apps、`packages/domain-core`（peer）。

```
packages/http-client/
├── src/
│   ├── http-service.ts   # HttpService 接口/基础类（框架无关）
│   └── index.ts
└── package.json          # peerDependencies: { @kkfive/contracts }
```

**关键原则：**

- **只定义抽象**：`HttpService` 接口/基础类、请求/响应类型，不含具体运行环境实现
- **实例由各 app 注入**：`apps/client` 注入浏览器 fetch 实例（`src/service/index.client.ts`），`apps/admin` 注入服务端实例（`src/service/index.server.ts`），`apps/api`（Hono）同进程直调 domain-core，不经过 HttpService
- **天然对接现有 DI 模式**：当前 `service.ts` 第一参数 `client: HttpService` 的设计无需重构，提取为共享包是零成本延伸

**注入示意：**

```typescript
// packages/domain-core/src/example/service.ts
import type { HttpService } from '@kkfive/http-client'
import type { User } from '@kkfive/contracts'

export function createUserService(client: HttpService) {
  return {
    async getUser(id: string): Promise<User> {
      return client.get(`/users/${id}`)
    },
  }
}

// apps/client/domain/example/index.ts — 注入浏览器实例
import { createUserService } from '@kkfive/domain-core/example'
import { httpClient } from '@/service/index.client'
export const userService = createUserService(httpClient)

// apps/admin/domain/example/index.ts — 注入服务端实例
import { createUserService } from '@kkfive/domain-core/example'
import { serverClient } from '@/service/index.server'
export const userService = createUserService(serverClient)
```

#### `packages/utils` — 工具函数

消费方：所有 apps、其余 packages。

```
packages/utils/
├── src/
│   ├── string.ts          # 字符串处理工具
│   ├── date.ts            # 日期工具
│   ├── validation.ts      # 通用校验辅助
│   └── ...
└── package.json           # 零运行时依赖
```

**关键原则：**

- 纯函数，无副作用，零运行时依赖
- 只放与业务无关的通用工具；业务相关的工具函数留在 app 的 `src/lib/` 或 `domain/`
- 不依赖 `packages/contracts`（工具函数不应绑定特定 schema）

#### `packages/ui` — 通用 UI 组件

消费方：client、admin（Next.js apps）。

```
packages/ui/
├── components/          # shadcn 二次封装 + 自实现基础组件
├── tokens/              # 设计 token（颜色、间距、圆角）
├── utils/               # UI 工具函数（cn()、createIcon 等）
├── styles/              # 全局样式变量
└── package.json         # peerDependencies: { react, react-dom }
```

**关键原则：**

- **只放 shadcn 二次封装与自实现基础组件**：Button、Dialog、Input、Table 等基础控件可以放这里；如果一个组件只为满足特定业务场景（如 `OrderDetailCard`、`UserSearchSelect`），它应该留在对应 app 的 `src/components/` 中
- **不含 antd**：antd 及 `@ant-design/*` 由各 app 按需自行安装，ConfigProvider / theme token 各 app 自治；本包不封装、不依赖 antd
- 不绑定业务逻辑，不导入 domain 或 app 代码
- React 作为 peer dependency，不打包进产物
- 各 app 通过 `@kkfive/ui` 引入基础控件，而非直接使用第三方 UI 库
- 组件文件按需声明 `'use client'`，由 Next.js 自动处理 client boundary

**判断标准：什么放 `packages/ui`，什么留在 app：**

| 放 `packages/ui` | 留在 `apps/*/src/components/` |
|---|---|
| Button、Input、Dialog、Select 等 shadcn 二次封装 | OrderTable、UserCard 等业务组件 |
| DataTable（通用排序/分页/筛选） | 特定业务的筛选面板 |
| 布局组件（Container、Stack） | 特定页面布局 |
| 图标系统、主题 token | 业务相关的颜色/样式覆盖 |
| —— | 基于 antd 的业务封装（antd 各 app 自治） |

### `internal/` — 内部工具链配置

`internal/` 存放项目内部的工具链配置预设，与 `packages/` 的核心区别：

- **`packages/`**：保持通用性，理论上可独立发布
- **`internal/`**：项目专属配置，不对外发布，仅服务于本仓库内的 apps 和 packages

#### `internal/tsconfig` — TypeScript 配置预设

```
internal/tsconfig/
├── base.json            # 基础配置（composite: true、declaration: true，所有包继承）
├── nextjs.json          # Next.js app 继承（含 jsx: react-jsx、Next.js plugins）
├── hono.json            # Hono app 继承（无 DOM lib）
└── package.json         # @kkfive/tsconfig 包定义（exports 暴露上述 .json 预设）
```

各 package 的 tsconfig 继承 `base.json`（packages 共用基础预设）；各 app 按技术栈继承 `nextjs.json` 或 `hono.json`。

各 app/package 通过 `extends` 继承：
```json
{
  "extends": "@kkfive/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"], "@domain/*": ["./domain/*"] }
  }
}
```

#### `internal/lint-config` — ESLint 配置预设

```
internal/lint-config/
├── preset.js            # ESLint 预设（基于 @antfu/eslint-config）
├── rules/               # 自定义规则（层级 import 约束等）
└── package.json
```

各 app 的 `eslint.config.js` 通过 import 继承预设，按需追加 app 专属规则。

#### `internal/tailwind-config` — Tailwind CSS 配置预设

```
internal/tailwind-config/
├── preset.ts            # Tailwind 预设（共享主题、色板、断点）
└── package.json
```

各 Next.js app 的 Tailwind 配置继承该预设，按需扩展。

#### `internal/nextjs-config` — Next.js 配置预设

```
internal/nextjs-config/
├── preset.ts            # 共享 Next.js 配置（transpilePackages、image domains 等）
└── package.json
```

client 和 admin 都使用 Next.js，必然存在相同配置。各 app 的 `next.config.ts` 通过合并继承：

```typescript
import { withRepoConfig } from '@kkfive/nextjs-config'

export default withRepoConfig({
  // 该 app 专属配置
})
```

#### `internal/node-utils` — Node.js 工具函数库

封装 Node.js 相关的**可复用函数**，仅在开发阶段使用（devDependency），不进入任何 app 的运行时。

```
internal/node-utils/
├── src/
│   ├── index.ts                  # 公开入口
│   └── convention-rules/         # 仓库约定校验的拆分函数（glob 匹配、import 边界检查等）
└── package.json                  # @kkfive/node-utils（devDependency）
```

**与 `scripts/` 的职责划分：**

- **`internal/node-utils`（`@kkfive/node-utils`）**：函数库。当 `scripts/` 中某个脚本需要拆分为独立函数时，函数落到这里。可被多个脚本复用，可被测试覆盖。
- **`scripts/`（仓库根）**：可执行脚本入口。每个 `.mjs`/`.ts` 文件是一个独立命令的入口（如 `verify-conventions.mjs`），负责组装流程、调用 `@kkfive/node-utils` 的函数、处理 CLI 参数与退出码。

```typescript
// internal/node-utils/src/convention-rules/domain-boundary.ts —— 可复用函数
import { glob } from 'glob'
export async function findDomainBoundaryViolations(pattern: string) { /* ... */ }

// scripts/verify-conventions.mjs —— 脚本入口
import { findDomainBoundaryViolations } from '@kkfive/node-utils'
const violations = await findDomainBoundaryViolations('apps/*/domain/**')
if (violations.length) { console.error(violations); process.exit(1) }
```

根 `package.json` 的 scripts 引用 `scripts/` 下的入口，scripts 内部依赖 `@kkfive/node-utils`：

```json
{
  "scripts": {
    "verify:conventions": "node scripts/verify-conventions.mjs"
  },
  "devDependencies": {
    "@kkfive/node-utils": "workspace:*"
  }
}
```

### 各 App 职责

> 本模板的 client / admin / api 三个 app 都是**示例应用**（template 示例，非真实业务需求），用于演示 monorepo 结构与多 app 协作。开发者 clone 后可删除/替换为自己的应用。

#### `apps/client` — Next.js 客户端

面向终端用户的 Web 应用（浏览器运行）。

```
apps/client/
├── domain/              # Domain 适配层
│   └── {module}/        # re-export @kkfive/domain-core + 注入浏览器 HttpService + React Query hooks
├── src/
│   ├── app/             # Next.js App Router 页面和轻量 BFF（API Routes）
│   ├── components/      # 客户端专属组件
│   │   ├── ui/          # 从 @kkfive/ui 适配或扩展（shadcn 体系）
│   │   ├── common/      # 通用功能组件
│   │   └── domain/      # 领域 UI 组件
│   ├── lib/             # 工具函数、错误处理
│   ├── service/         # 请求实例（index.client/server/sse，注入 domain-core）
│   ├── hooks/           # React Hooks
│   └── store/           # Zustand stores
├── next.config.ts       # extends @kkfive/nextjs-config + transpilePackages
├── tsconfig.json        # extends @kkfive/tsconfig/nextjs.json
├── eslint.config.js     # imports @kkfive/lint-config
└── package.json         # dependencies: { @kkfive/contracts, @kkfive/domain-core, @kkfive/http-client, @kkfive/utils, @kkfive/ui }
```

**关键原则：**

- `src/app/api/` 仅承担轻量 BFF（Backend for Frontend）角色，不承担主要业务逻辑；真正的后端业务接口在 `apps/api`（Hono）
- `apps/api`（Hono）是独立的后端服务进程，client 通过 HTTP 调用它，两者不共享运行时
- `src/service/` 注入浏览器 HttpService 实例给 `@kkfive/domain-core`；HTTP 客户端实例是 app 专属，不提取为共享包（抽象在 `@kkfive/http-client`）
- antd 按需自行安装（本模板示例以 shadcn 体系为主；如需 antd，app 内自治 ConfigProvider）

#### `apps/admin` — Next.js 管理后台

面向内部运营人员的管理系统（SSR 运行）。结构与 client 类似，但运行环境侧重不同。

```
apps/admin/
├── domain/              # Domain 适配层
│   └── {module}/        # re-export @kkfive/domain-core + 注入服务端 HttpService（按需 SSR hooks）
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── service/         # 注入服务端实例（index.server）
│   ├── hooks/
│   └── store/
├── next.config.ts
├── tsconfig.json        # extends @kkfive/tsconfig/nextjs.json
├── eslint.config.js     # imports @kkfive/lint-config
└── package.json         # dependencies: { @kkfive/contracts, @kkfive/domain-core, @kkfive/http-client, @kkfive/utils, @kkfive/ui }
```

**与 client 的区别**：运行环境（SSR vs 浏览器）→ 注入不同的 HttpService 实例、可能不需要 React Query hooks（SSR 直取）。

#### `apps/api` — Hono API 服务

提供核心业务接口的后端服务（相当于传统业务架构中的后端 API 服务），独立部署、独立扩缩容。承担鉴权、数据持久化、业务编排等后端职责，与前端的 Next.js app 是两个独立进程。

```
apps/api/
├── domain/              # Domain 适配层
│   └── {module}/        # re-export @kkfive/domain-core（同进程直调，无 hooks、无 HttpService 注入）
├── src/
│   ├── routes/          # Hono 路由定义（HTTP 协议适配层）
│   ├── middleware/       # Hono 中间件（认证、日志、错误处理、CORS）
│   ├── lib/             # 服务端基础设施（数据库客户端、缓存、第三方 SDK 等）
│   └── app.ts           # Hono app 入口
├── tsconfig.json        # extends @kkfive/tsconfig/hono.json
├── eslint.config.js     # imports @kkfive/lint-config
└── package.json         # dev: tsx watch src/app.ts；build: tsup；dependencies: { @kkfive/contracts, @kkfive/domain-core, @kkfive/utils, hono }
```

**关键原则：**

- **后端服务定位**：这是真正的后端，不是边缘函数或 BFF。它处理鉴权、读写数据库、编排业务逻辑，是 client/admin 等前端的数据源
- **同进程直调 domain-core**：domain 适配层无 hooks、无 HttpService 注入，Hono 路由同进程直调 `@kkfive/domain-core` 的 controller（无需走 HTTP）
- **基础设施各 app 自治**：数据库客户端、缓存、第三方 SDK 等放 `src/lib/`，是 api 专属，不进共享包（这些是后端实现细节，不该污染前端）
- 使用 `@kkfive/contracts` 的 schema 做请求校验和响应类型
- 路由层仅负责 HTTP 协议适配，业务逻辑在 domain-core 层

### 依赖规则

#### 应用间依赖

| 层 | 可以依赖 | 禁止依赖 |
|---|---|---|
| `apps/*` | `packages/*`、`internal/*`、外部 npm 包 | 其他 `apps/*` |
| `packages/contracts` | zod（纯逻辑库） | React、Hono、Next.js、任何 `apps/*` |
| `packages/domain-core` | `@kkfive/contracts`、`@kkfive/utils`、`@kkfive/http-client`（peer） | React、Hono、Next.js、任何 `apps/*`、`@kkfive/ui` |
| `packages/http-client` | `@kkfive/contracts`（peer） | React、Hono、Next.js、任何 `apps/*`、`@kkfive/ui`、`@kkfive/domain-core` |
| `packages/utils` | 零运行时依赖 | React、Hono、Next.js、任何 `apps/*`、`@kkfive/contracts` |
| `packages/ui` | React（peer dep）、shadcn/Radix、Tailwind | 任何 `apps/*`、`@kkfive/contracts`（除非纯类型）、antd |
| `internal/*` | ESLint 插件、TypeScript 插件、Tailwind 插件等构建工具 | 任何 `apps/*`、`packages/*`、运行时框架 |

#### 应用内依赖（Next.js apps: client/admin）

> app 内 `domain/` 是适配层（re-export `@kkfive/domain-core` + 注入 HttpService + 可选 hooks），核心逻辑在共享包。

| 层 | 可以导入 | 禁止导入 |
|---|---|---|
| `domain/` | `@kkfive/domain-core`、`@kkfive/contracts`、`@kkfive/http-client`、`@/service/*`（注入实例）、外部库、`@tanstack/react-query`（仅 hooks 适配） | `@/components/*`、`@/app/*`、`@/hooks/*`、`@/store/*` |
| `src/components/domain/` | `domain/*`、`@kkfive/ui`、`@/components/ui/*`、`@/components/common/*`、`@/lib/*` | 第三方 UI 库直接导入（antd 除外，antd app 内自治） |
| `src/components/common/` | `@kkfive/ui`、`@/components/ui/*`、`@/lib/*`、外部库 | `domain/*`、业务逻辑 |
| `src/components/ui/` | `@kkfive/ui`、第三方 UI 库（shadcn 体系） | `domain/*`、`@/components/common/*`、业务逻辑 |
| `src/app/` | `domain/*`、`@/components/*`、`@kkfive/*`、`@/lib/*`、`@/hooks/*`、`@/store/*` | 第三方 UI 库直接导入 |

#### 应用内依赖（Hono app: api）

> app 内 `domain/` 是适配层（re-export `@kkfive/domain-core`，同进程直调，无 hooks、无 HttpService 注入）。

| 层 | 可以导入 | 禁止导入 |
|---|---|---|
| `domain/` | `@kkfive/domain-core`、`@kkfive/contracts`、`@/lib/*`、外部库 | `src/routes/*`、任何 HTTP 框架 API、`@kkfive/http-client` |
| `src/routes/` | `domain/*`、`@kkfive/contracts`、`@/lib/*`、`@/middleware/*` | `domain/` 内部文件（通过入口导入） |
| `src/middleware/` | `@/lib/*`、外部库 | `domain/*`、`src/routes/*` |

**依赖流向：**

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

### 构建与工具链

#### Turborepo 任务编排

> 关键：`lint`/`test` 不依赖 `^build`（lint 检查源码，无需等产物）；`typecheck` 走 project references（`^typecheck`）跨包增量检查；packages 走源码消费（transpilePackages），无需为"被消费"而 build。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": []
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": []
    },
    "test:run": {
      "dependsOn": []
    },
    "verify:conventions": {
      "dependsOn": []
    }
  }
}
```

#### 包消费策略：transpilePackages 源码消费（dev 零配置 HMR）

packages **不预 build**，各 Next.js app 通过 `transpilePackages` 直接消费 workspace 包的源码。这样开发时改 package 源码即时 HMR，无需 watch build。

各 Next.js app 的 `next.config.ts`：

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: [
    '@kkfive/contracts',
    '@kkfive/domain-core',
    '@kkfive/http-client',
    '@kkfive/utils',
    '@kkfive/ui',
  ],
}

export default config
```

各 package 的 `package.json` exports 直接指向源码（无 build 产物）：

```json
{
  "name": "@kkfive/utils",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  }
}
```

**apps/api（Hono）的消费策略**：Hono app 非 Next.js，无 `transpilePackages`，但仍**走源码消费**——开发用 `tsx` 直接运行 `.ts`，生产用 `tsup` 打包整个 app（打包时把 workspace 包源码一起 bundle 进去）。这样所有 app 消费策略一致，packages 永远不需要为"被消费"而预 build。

**何时才需要 build packages**：仅当某个 package 要独立发布到 npm（本模板不发布）。本模板默认全走源码消费，apps/api 的 tsup 打包是 app 级构建，不触发 package 级 build。

#### TypeScript project references

跨包类型检查用 TS project references（`composite: true`），根 `tsconfig.json` 做 solution 配置，`tsc --build` 增量跨包检查：

```
tsconfig.json                       # 根 solution（references 指向所有包）
internal/tsconfig/base.json         # 基础配置（composite: true）
packages/*/tsconfig.json            # extends base，references 指向依赖的包
apps/*/tsconfig.json                # extends @kkfive/tsconfig/{nextjs|hono}.json
```

**base.json 关键字段**（`composite` 强制 `declaration: true`，与源码消费兼容）：

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "incremental": true,
    "strict": true,
    "moduleResolution": "bundler",
    "noEmit": false
  }
}
```

**各 package 的 tsconfig 必须 `references` 声明依赖的包**（否则 `tsc --build` 不认依赖图）：

```json
// packages/domain-core/tsconfig.json
{
  "extends": "@kkfive/tsconfig/base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"],
  "references": [
    { "path": "../contracts" },
    { "path": "../http-client" }
  ]
}
```

**根 solution tsconfig**（`tsc --build` 的入口，只编排不编译）：

```json
// tsconfig.json（根）
{
  "files": [],
  "references": [
    { "path": "packages/contracts" },
    { "path": "packages/http-client" },
    { "path": "packages/domain-core" },
    { "path": "packages/utils" },
    { "path": "apps/client" },
    { "path": "apps/admin" },
    { "path": "apps/api" }
  ]
}
```

#### 路径别名

各 app 的 `tsconfig.json` 继承 `@kkfive/tsconfig/` 对应预设，并定义自己的路径别名：

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

> `@kkfive/*` 不走 tsconfig paths，走 workspace 协议（`pnpm` 自动解析到 `packages/*`）。tsconfig paths 仅用于 app 内部别名（`@/*`、`@domain/*`）。

### 幽灵依赖防御

pnpm 严格模式（workspace 生效后，每个 package 只能访问自己 `package.json` 显式声明的依赖）会在 Phase 1 加上 `packages:` 字段后立即生效。为避免幽灵依赖爆发，采取三层防御：

**1. pnpm 严格化**（根 `package.json`）：

```json
{
  "pnpm": {
    "strictPeerDependencies": true,
    "auto-install-peers": false,
    "verify-deps-before-run": true
  }
}
```

`auto-install-peers: false` 强制每个包显式声明 peer 依赖，是堵幽灵依赖的关键。

**2. 每个新 package 显式声明全部依赖**：pnpm 严格模式下未声明的 import 直接解析失败（fail fast），这是根本保障。新建 package 时 MUST 完整填写 `dependencies` / `peerDependencies` / `devDependencies`。

**3. syncpack CI 兜底**（检测幽灵依赖 + 跨包版本漂移）：

```bash
pnpm add -Dw syncpack
# 根 package.json: "verify:deps": "syncpack check"
```

syncpack 比 verify-conventions 手写规则更可靠地检测跨包依赖不一致与未声明导入。

### 文档组织

文档按影响范围分层：

| 位置 | 影响范围 | 内容 |
|---|---|---|
| `docs/` | 仓库全局 | ADR、整体架构说明、全局约定 |
| `docs/decisions/` | 仓库全局 | 架构决策记录 |
| `apps/{app}/docs/` | 单个 app | app 专属的集成说明、部署文档 |
| `packages/{pkg}/` | 单个 package | README 级别的包说明 |

**原则**：影响范围 = 文档位置。ADR 和全局约定影响所有 app，放根级 `docs/`；特定 app 的集成指南放 app 内部。

### AI 辅助开发规范

#### AGENTS.md 层级体系

monorepo 中 AI 规范采用**根级 + 按需覆盖**的层级体系。大多数子目录直接继承根级规则，只有当某个 app 或 package 有**专属约束**时才创建自己的 `AGENTS.md`：

```
AGENTS.md                          # 根级入口：monorepo 全局规则 + .agents/ 索引
├── apps/*/AGENTS.md               # 按需：app 专属规则（仅在有专属约束时创建）
└── packages/*/AGENTS.md           # 按需：package 专属规则（仅在有专属约束时创建）
```

**继承规则：**

- **无 `AGENTS.md` 的子目录**：直接继承根级 `AGENTS.md` 的全部规则，无需额外配置
- **有 `AGENTS.md` 的子目录**：继承根级规则，在此基础上补充或覆盖。只在该目录及子目录下生效
- **冲突处理**：子级规则优先于根级（就近原则），但不可违反根级的硬性约束（如 import 边界、packages 通用性原则）

**当前需要专属 `AGENTS.md` 的场景：**

| 文件 | 创建原因 | 内容 |
|---|---|---|
| 根 `AGENTS.md` | 全局基线 | monorepo 结构说明、全局 import 规则、分层原则、`.agents/` 索引 |
| `apps/api/AGENTS.md` | 技术栈不同 | Hono 路由组织、中间件链、无 React/Next.js 的约束 |
| `packages/ui/AGENTS.md` | 通用性约束 | 组件必须通用、禁止导入业务代码、peer deps 约束 |

client 和 admin 技术栈相同且规则一致，暂时不需要各自的 `AGENTS.md`，直接继承根级规则。当某个 app 发展出专属约束时再创建。`internal/*` 是纯配置，不需要 `AGENTS.md`。

#### Rules（按文件路径条件加载）

`.agents/rules/` 位于仓库根目录，按文件路径条件加载，全局生效：

| Rule | 加载时机 | 核心变更 |
|---|---|---|
| `core.rule.md` | Always | 增加 monorepo 分层描述和 apps/packages 边界 |
| `monorepo.rule.md` | Always | workspace import 规则、新增 app/package 约束 |
| `domain.rule.md` | `apps/*/domain/**` | domain 适配层 + 与 `@kkfive/domain-core` / `@kkfive/contracts` 的关系 |
| `ui.rule.md` | `**/components/**` 或 `packages/ui/**` | `@kkfive/ui` 与 app 组件的边界 |
| `next-app.rule.md` | `apps/client/src/app/**` 或 `apps/admin/src/app/**` | 多 app 场景 |
| `hono.rule.md` | `apps/api/**` | Hono 路由组织和 domain 层关系 |
| `testing.rule.md` | 测试文件 | 各层测试策略 |
| `packages.rule.md` | `packages/**` | 构建规范、exports 配置 |

**Skills（按任务触发）：**

| Skill | 触发场景 | 核心变更 |
|---|---|---|
| `project-architecture` | 决定代码位置、检查 import | 重写为 monorepo 分层 |
| `domain-layer` | 新建 domain 模块 | 补充与 `@kkfive/domain-core` 的关系（共享纯逻辑 + app 适配层） |
| `coding-standards` | 写代码时 | 补充 workspace import 语法 |
| `nextjs-app-router` | 新建页面/路由 | 补充多 app 注意事项 |
| `hono-api`（新增） | 新建 API 路由 | Hono 路由组织和 schema 校验 |
| `create-package`（新增） | 新建共享包 | 目录结构、exports、构建配置 |
| `create-app`（新增） | 新建应用 | 应用模板和 workspace 注册 |

### 迁移阶段

> **Phase 0/1 顺序说明**：Phase 0 编写的规则按 monorepo 目标路径写（如 `apps/*/domain/`），但此时目录还不存在，规则的 verify 验证无法通过——这是预期的。Phase 0 只产规则文本，**规则的真实路径验证延后到 Phase 1 末尾**（apps/client 搬入后）统一执行。Phase 1 完成的判据包含"verify-conventions 在新结构下通过"。

```
Phase 0: 制定 AI 规范
  - 改写现有 4 个 skill（project-architecture / domain-layer / coding-standards / nextjs-app-router）
    以适配 monorepo 路径（apps/* 下的分层、@kkfive/* 引用、domain 适配层模式）
  - 新增 3 个 skill：hono-api、create-package、create-app
  - 更新 rules（新增 monorepo.rule.md / hono.rule.md / packages.rule.md，改写 core / domain / ui / next-app）
  - 更新 AGENTS.md（根级 + 按需创建 apps/api/AGENTS.md、packages/ui/AGENTS.md）
  - 扩展 verify-conventions.mjs：glob 覆盖 apps/*/domain/ 与 packages/*/
  - 注：本阶段只产规则文本，不验证（目标路径尚不存在）；验证在 Phase 1 末尾统一执行

Phase 1: 搭建 monorepo 骨架
  - turbo.json（lint/test 无 ^build 依赖，typecheck 走 ^typecheck）
  - pnpm-workspace.yaml 加 packages: ['apps/*', 'packages/*', 'internal/*']
  - 同步落地幽灵依赖防御（根 package.json 的 pnpm 严格化字段 + syncpack + no-extraneous-dependencies lint）
  - internal/（tsconfig / lint-config / tailwind-config / nextjs-config / node-utils）
  - tsconfig project references（根 solution + 各包 composite）
  - 当前项目整体搬入 apps/client
  - 重写硬编码路径：verify-conventions.mjs 的 domain/ 规则、eslint.config.js 的 layer-import glob、
    tsconfig paths（@/* / @domain/* 指向 apps/client 内）
  - 验证 Phase 0 规则：确认 verify-conventions / ESLint / typecheck 在新 monorepo 结构下通过
  - 确保 build/lint/test/typecheck 在 monorepo 下正常运行（Phase 1 完成判据）

Phase 2: 提取共享包
  - packages/contracts（zod-first schema + 共享类型 + http/error 契约）
  - packages/utils（纯工具函数）
  - packages/http-client（HttpService 接口/基础类）
  - packages/domain-core（从 domain/example 提取 service/controller/type/const，框架无关）
  - packages/ui（shadcn 二次封装 + 自实现基础组件，不含 antd）
  - apps/client 的 domain 改为适配层（re-export domain-core + 注入 HttpService + React Query hooks）
  - 各 Next.js app 的 next.config.ts 加 transpilePackages
  - vitest workspace 配置（vitest.workspace.ts + 跨包测试 + 覆盖率聚合）
  - CI 改造：turbo run + --filter affected 策略 + 单次 install

Phase 3: 新建示例 apps（template 示例，非真实需求）
  - apps/admin（Next.js SSR，基于 create-app 模板，注入服务端 HttpService）
  - apps/api（Hono，基于 create-app 模板，同进程直调 domain-core）
  - 接入 Turborepo 任务编排
  - 验证三 app 协作（client/admin 消费 domain-core + contracts，api 生产 contracts）
```

**迁移期间约束**：Phase 1-2 目录重构期间，避免在其他功能分支并行修改 `domain/` 或 `src/`，否则 merge 会产生 `domain/` vs `apps/*/domain/` 的路径冲突（git 无法自动合并）。

## 后果

**正面：**

- 多应用共享纯业务逻辑（`@kkfive/domain-core`），消除 service/controller 跨 app 重复实现
- 多应用共享类型定义（`@kkfive/contracts`），消除 API 契约在客户端和服务端的重复定义与漂移
- 各应用独立构建和部署，互不干扰
- 统一配置降低多应用维护成本
- Turborepo 的缓存机制加速 CI 和本地构建
- transpilePackages 源码消费让 packages 开发体验与单仓一致（零配置 HMR）
- 开发者可以通过 `create-app` 快速新建应用

**负面：**

- monorepo 增加了仓库配置复杂度（workspace、turbo、project references、幽灵依赖防御）
- 共享包的版本管理需要关注（workspace 内部用 `workspace:*`，但 breaking change 会影响所有消费方）
- 初次迁移工作量大，需要同时处理代码搬迁、路径重写和规范重写
- 开发者的 IDE 和工具链需要适应 monorepo 结构（路径别名、ESLint scope、project references）

**风险：**

- `packages/contracts` 或 `packages/utils` 如果引入运行时依赖，会污染所有消费方的 bundle — 通过 pnpm 严格模式、syncpack、ESLint 规则和 CI 检查防御
- `packages/domain-core` 如果混入 React/Hono 依赖，会破坏框架无关性 — 通过依赖规则表 + verify-conventions 脚本 + ESLint layer-import 防御
- `packages/ui` 过度抽象可能导致组件调试困难 — 保持薄封装，不隐藏原始 API；明确不含 antd，避免与 app 内 antd 体系冲突
- 幽灵依赖在 Phase 1 workspace 生效后立即爆发 — 前置防御（pnpm 严格化 + syncpack）在 Phase 1 同步落地
