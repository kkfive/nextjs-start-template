# Gotchas

## 跨层 import

- **`domain/` 里 import `@/components/*`** → 反向依赖，Domain 应该框架无关；改为把 UI 逻辑放到调用方
- **`domain/` 里 import `@/hooks/*` 或 `@/store/*`** → 同上；hooks 是适配层，反向依赖会让 Domain 锁死客户端
- **`src/components/ui/` 里 import `@domain/*`** → UI 通用层不能依赖业务；下沉到 `src/components/domain/`
- **`src/components/common/` 直接 import `antd`** → 必须经 `@/components/ui/*`
- **`src/app/` 直接 import `antd`** → 同上；唯一例外是根 layout 的 `ConfigProvider`

## 循环依赖

- **`domain/a` ↔ `domain/b` 互引** → 把共享类型抽到 `domain/<shared>` 或 `src/lib/types`
- **`controller.ts` 引 `hooks.ts`** → hooks 是 React 适配层，反向；让调用方组合

## 文件位置错乱

- **可复用组件放在 `src/app/components/`** → `src/app` 仅放路由元素；下沉到 `src/components/`
- **业务能力写在 `src/lib/`** → `src/lib` 仅放无业务的工具与运行环境适配；下沉到 `domain/`
- **HTTP 实例写在 `domain/`** → 实例选择是运行环境，放 `src/service/`；Domain 只接受注入

## 命名

- **目录用 camelCase** → 用 kebab-case（`user-profile/`）
- **组件文件名 PascalCase** → 文件名 kebab-case；导出的组件名才是 PascalCase
- **Hook 文件不以 `use-` 开头** → `use-material-list.ts`，导出 `useMaterialList`

## 何时新建 vs 复用

- 写第二次 → 还不抽
- 写第三次相似的 → 抽到对应层（功能性 → `common/`；业务相关 → `domain/`）
- "复用 ≠ 抽象"：先内联到 3 处，再看真正的差异点决定抽象边界

## 与其他 skill 的边界

- 文件级写法 / 函数式组件 / 错误处理 → `/coding-standards`
- Domain 内部 Service / Controller / Hooks 分层 → `/domain-layer`
- `src/app/` 的路由约定 → `/nextjs-app-router`
- 样式调到哪一层 → `/styling-system`
