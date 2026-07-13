# Gotchas

## 跨包误引（monorepo 专属）

- **`packages/*` 里 import `apps/*`** → 反向依赖；`AppType` 由 app service 消费，不进入 package
- **`packages/rpc` 里 import AppType、业务 calls、React / react-query / Next** → 破坏框架无关性；rpc 只提供泛型 factory 与 envelope
- **`packages/http-client` 里 import `@kkfive/rpc`** → 反向依赖；rpc 依赖 http-client(peer)，不可反向
- **app A 的代码 import app B** → apps 之间禁止互相依赖；共享内容提取为 package
- **幽灵依赖**（用了未声明的包）→ pnpm 严格模式下直接解析失败；新建包时 MUST 完整填写 dependencies / peerDependencies

## 跨层 import（应用内）

- **`src/service/` 里 import `@/components/*`、`@/features/*` 或 `@/app/*`** → 运行时实例不依赖 UI、业务或路由
- **client component import `@/service/rpc-server`** → server/client 双实例由 `server-only`/`client-only` 强制隔离；client 组件只能引 `rpc-client`，server component 只能引 `rpc-server`
- **`src/components/` 里 import feature 私有 call/model** → app 共享 UI 不依赖业务；下沉到所属 feature
- **为 `@kkfive/ui` 或 antd 建纯 re-export** → 直接使用稳定入口；只有真实加工时才封装

## 文件位置错乱

- **可复用组件放在 `src/app/components/`** → `src/app` 仅放路由元素；下沉到 `src/components/`
- **业务 calls 写在 `src/lib/`、`src/service/` 或 `packages/rpc`** → 放所属 `src/features/<feature>/`
- **HTTP 实例或 hc 客户端写进共享包** → 实例是运行环境，放各 app 的 `src/service/`；`createRpcClient` 接收注入的 HttpService
- **React Query hooks 写进 `@kkfive/rpc` 或 `src/service/`** → package 与 service 不含 hooks；hooks 放所属 feature
- **只在某一 app 用到的东西放进 `packages/`** → packages 必须通用；先在 app 实现，等第二个消费方再提取

## 命名

- **目录用 camelCase** → 用 kebab-case（`user-profile/`）
- **组件文件名 PascalCase** → 文件名 kebab-case；导出的组件名才是 PascalCase
- **Hook 文件不以 `use-` 开头** → `use-material-list.ts`，导出 `useMaterialList`

## 何时新建 vs 复用

- 先在业务归属处实现；出现第二个真实消费者后再评估提取
- 只有框架无关、边界稳定的能力进入 package，业务 calls 始终留 app feature

## 与其他 skill 的边界

- 文件级写法 / 函数式组件 / 错误处理 → `/coding-standards`
- 跨包/跨层 import 黑名单 → `/coding-standards` 的 `references/layer-dependency.md`
- `apps/*/src/app/` 的路由约定 → `/nextjs-app-router`
- 新建共享包 / 新建应用 → 先检索现有结构，再按根 `AGENTS.md` 的三层边界实现
- 样式调到哪一层 → `/styling-system`
