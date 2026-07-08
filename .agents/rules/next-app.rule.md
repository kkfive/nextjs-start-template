# Next App Rule

每个 Next.js app（`apps/client`、`apps/admin`）的 `src/app` 表达路由、布局和运行时入口，不承载可复用组件。多个 app 各自独立构建、独立部署，共享 `@kkfive/*` 包。

页面应组合已有 Domain 适配层、UI 和基础设施能力。可复用视图下沉到该 app 的 `src/components`，业务纯逻辑下沉到 `@kkfive/domain-core`（由该 app 的 `domain/` 适配层 re-export），请求实例和运行时适配放在该 app 的 `src/service` 或 `src/lib`。

Server Component 是默认选择；只有交互、浏览器 API、客户端状态或 React Query hooks 需要时，才引入 `'use client'`。各 app 的配置（Next.js / Tailwind / tsconfig）通过继承 `internal/*` 预设保持一致。
