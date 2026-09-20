# Gotchas

机器已拦截的不再列出（跨包反向依赖、AppType 误消费、透传 re-export、幽灵依赖、文件名大小写分别由 FFG / eslint / pnpm 强制）。以下均为归属判断类陷阱。

## 文件位置错乱

- **可复用组件放在 `src/app/` 下** → `src/app` 仅放路由元素；下沉到该 app 的 `src/components/`
- **业务 calls 写在 `src/lib/`、`src/service/` 或 `packages/rpc`** → 放所属 `src/features/<feature>/model/`
- **HTTP 实例或 hc 客户端写进共享包** → 实例是运行环境，放各 app 的 `src/service/`；`createRpcClient` 接收注入的 HttpService
- **React Query hooks 写进 `@kkfive/rpc` 或 `src/service/`** → package 与 service 不含 hooks；hooks 放所属 feature
- **只在某一 app 用到的东西放进 `packages/`** → packages 必须通用；先在 app 实现，等第二个真实消费方再提取

## 何时新建 vs 复用

- 先在业务归属处实现；出现第二个真实消费者后再评估提取
- 只有框架无关、边界稳定的能力进入 package，业务 calls 始终留 app feature

## 与其他 skill 的边界

- 文件级写法 / 错误处理 → `/coding-standards`
- `apps/*/src/app/` 的路由约束 → `/nextjs-app-router`
- 样式方案选择 → `/styling-system`
