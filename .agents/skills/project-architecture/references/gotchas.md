# Gotchas

## 跨包误引（monorepo 专属）

- **`packages/*` 里 import `apps/*`（运行时）** → 反向依赖，共享包禁止依赖应用（唯一例外：rpc 经 type-only 引 api 的 `AppType`）；逻辑下沉错了，应留在 app 或提升到合适的 package
- **`packages/rpc` 里 import React / react-query / Next** → 破坏框架无关性；hooks、组件留各 app，rpc 只提供纯调用函数
- **`packages/http-client` 里 import `@kkfive/rpc`** → 反向依赖；rpc 依赖 http-client(peer)，不可反向
- **app A 的代码 import app B** → apps 之间禁止互相依赖；共享内容提取为 package
- **幽灵依赖**（用了未声明的包）→ pnpm 严格模式下直接解析失败；新建包时 MUST 完整填写 dependencies / peerDependencies

## 跨层 import（应用内）

- **`src/service/` 里 import `@/components/*`、`@/features/*` 或 `@/app/*`** → 运行时实例不依赖 UI、业务或路由
- **client component import `@/service/rpc-server`** → server/client 双实例由 `server-only`/`client-only` 强制隔离；client 组件只能引 `rpc-client`，server component 只能引 `rpc-server`
- **`src/components/ui/` 里 import 业务调用（`@kkfive/rpc` calls）** → UI 通用层不依赖业务；下沉到业务组件
- **`src/components/common/` 直接 import 第三方 UI 库（非 @kkfive/ui）** → 必须经 `@/components/ui/*` 或 `@kkfive/ui`
- **`src/app/` 直接 import 第三方 UI 库（非 @kkfive/ui）** → 同上；唯一例外是根 layout 的 `ConfigProvider`（antd 由各 app 自治）

## 循环依赖

- **`packages/rpc` 的 `module/a` ↔ `module/b` 互引** → 把共享类型抽到 `@kkfive/contracts`
- **`@kkfive/rpc` calls 引 app 的 hooks** → hooks 是 app 专属，反向；hooks 组合 calls，不是 calls 引 hooks

## 文件位置错乱

- **可复用组件放在 `src/app/components/`** → `src/app` 仅放路由元素；下沉到 `src/components/`
- **业务 calls 写在 `src/lib/` 或 `src/service/`** → 跨 app 的自有 API calls 进 `@kkfive/rpc`；app 专属 calls 放所属 `src/features/<feature>/`
- **HTTP 实例或 hc 客户端写进共享包** → 实例是运行环境，放各 app 的 `src/service/`；`createRpcClient` 接收注入的 HttpService
- **React Query hooks 写进 `@kkfive/rpc` 或 `src/service/`** → rpc 和 service 不含 hooks；hooks 放所属 feature（缓存策略自治）
- **只在某一 app 用到的东西放进 `packages/`** → packages 必须通用；先在 app 实现，等第二个消费方再提取

## 命名

- **目录用 camelCase** → 用 kebab-case（`user-profile/`）
- **组件文件名 PascalCase** → 文件名 kebab-case；导出的组件名才是 PascalCase
- **Hook 文件不以 `use-` 开头** → `use-material-list.ts`，导出 `useMaterialList`

## 何时新建 vs 复用

- 写第二次 → 还不抽
- 写第三次相似的 → 抽到对应层（功能性 → `common/`；业务相关 → feature；跨 app 共享的自有 API calls → `packages/rpc`）
- "复用 ≠ 抽象"：先内联到 3 处，再看真正的差异点决定抽象边界

## 与其他 skill 的边界

- 文件级写法 / 函数式组件 / 错误处理 → `/coding-standards`
- 跨包/跨层 import 黑名单 → `/coding-standards` 的 `references/layer-dependency.md`
- `apps/*/src/app/` 的路由约定 → `/nextjs-app-router`
- 新建共享包 / 新建应用 → `.agents/meta/create-package/SKILL.md`、`.agents/meta/create-app/SKILL.md`
- 样式调到哪一层 → `/styling-system`
