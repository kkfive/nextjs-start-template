# apps/api 增量规则

独立 Hono 服务进程，提供类型化 RPC、SSE 和独立部署的后端能力。

- 当前业务在 `src/routes/` handler 内闭环；复杂逻辑可在对应 route 目录拆为纯函数，不预设不存在的业务分层。
- `src/lib/` 只放数据库、缓存和第三方 SDK 等基础设施；middleware 只处理横切关注点。
- `dev` 使用 `tsx watch src/server.ts`；`build` 使用 `tsdown`；tsconfig 继承 Hono preset。

Hono 任务由根 `AGENTS.md` 路由到 `.agents/rules/hono.rule.md`；不触发 Next.js 或前端样式 Skill。
