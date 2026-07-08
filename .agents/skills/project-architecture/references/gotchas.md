# Gotchas

## 跨包误引（monorepo 专属）

- **`packages/*` 里 import `apps/*`** → 反向依赖，共享包禁止依赖应用；逻辑下沉错了，应留在 app 或提升到合适的 package
- **`packages/domain-core` 里 import React / Next / Hono** → 破坏框架无关性；hooks、路由、组件留在各 app 适配层
- **app 的 `domain/` 适配层里写核心业务逻辑** → 核心逻辑应下沉到 `@kkfive/domain-core`；适配层只 re-export + 注入实例 + 可选 hooks
- **app A 的代码 import app B** → apps 之间禁止互相依赖；共享内容提取为 package
- **幽灵依赖**（用了未声明的包）→ pnpm 严格模式下直接解析失败；新建包时 MUST 完整填写 dependencies / peerDependencies

## 跨层 import（应用内）

- **app 的 `domain/` 里 import `@/components/*`** → Domain 适配层不依赖 UI
- **app 的 `domain/` 里 import `@/hooks/*` 或 `@/store/*`** → 同上；适配层只做 domain-core 的环境包装
- **`src/components/ui/` 里 import `@domain/*`** → UI 通用层不能依赖业务；下沉到 `src/components/domain/`
- **`src/components/common/` 直接 import 第三方 UI 库（非 @kkfive/ui）** → 必须经 `@/components/ui/*` 或 `@kkfive/ui`
- **`src/app/` 直接 import 第三方 UI 库（非 @kkfive/ui）** → 同上；唯一例外是根 layout 的 `ConfigProvider`（antd 由各 app 自治）

## 循环依赖

- **`packages/domain-core` 的 `module/a` ↔ `module/b` 互引** → 把共享类型抽到 `@kkfive/contracts` 或 domain-core 的 `_shared/`
- **`controller.ts` 引 `hooks.ts`** → hooks 是 app 适配层，反向；让调用方组合

## 文件位置错乱

- **可复用组件放在 `src/app/components/`** → `src/app` 仅放路由元素；下沉到 `src/components/`
- **业务能力写在 `src/lib/`** → `src/lib` 仅放无业务的工具与运行环境适配；业务纯逻辑下沉到 `@kkfive/domain-core`
- **HTTP 实例写在 `domain/` 或共享包** → 实例选择是运行环境，放各 app 的 `src/service/`；Domain 只接受注入
- **只在某一 app 用到的东西放进 `packages/`** → packages 必须通用；先在 app 内实现，等第二个消费方再提取

## 命名

- **目录用 camelCase** → 用 kebab-case（`user-profile/`）
- **组件文件名 PascalCase** → 文件名 kebab-case；导出的组件名才是 PascalCase
- **Hook 文件不以 `use-` 开头** → `use-material-list.ts`，导出 `useMaterialList`

## 何时新建 vs 复用

- 写第二次 → 还不抽
- 写第三次相似的 → 抽到对应层（功能性 → `common/`；业务相关 → `domain/`；跨 app 复用 → `packages/`）
- "复用 ≠ 抽象"：先内联到 3 处，再看真正的差异点决定抽象边界

## 与其他 skill 的边界

- 文件级写法 / 函数式组件 / 错误处理 → `/coding-standards`
- Domain 适配层与共享包的内部结构 → `/domain-layer`
- `apps/*/src/app/` 的路由约定 → `/nextjs-app-router`
- 新建共享包 / 新建应用 → `/create-package`、`/create-app`
- 样式调到哪一层 → `/styling-system`
