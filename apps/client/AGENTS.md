# apps/client 增量规则

面向终端用户的 Next.js App Router 应用；`src/app/api/` 可提供轻量 BFF。

- antd 与 `@ant-design/*` 由 client 自治，不进入 `@kkfive/ui`；如使用全局 ConfigProvider/theme token，由 app provider 层维护。
- antd 的跨 feature 封装放 `src/components/`，feature 专属封装留在 feature。
- 环境变量通过 `@t3-oss/env-nextjs` 校验；新增项同步登记 `src/config/env.ts` 与 `.env.example`。
- SSE 拦截器不得写 `console.error` / `console.warn`。

通用 Feature、service runtime 和 App Router 边界由根 `AGENTS.md` 路由到对应 owner rule。
