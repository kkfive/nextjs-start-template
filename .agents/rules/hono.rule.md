# Hono Rule

`apps/api` 是独立的后端服务进程（Hono），承担鉴权、数据持久化、业务编排等后端职责，不是边缘函数或 BFF。它独立部署、独立扩缩容，与前端 Next.js app 是两个进程。

路由层（`src/routes/`）只负责 HTTP 协议适配：解析请求、用 `@kkfive/contracts` 的 schema 校验入参、调用 Domain 公共入口、格式化响应。业务逻辑在 `@kkfive/domain-core` 的 Controller 中，路由不写业务规则。

Domain 适配层同进程直调 Controller，不经过 HttpService、不注入任何 HTTP 客户端、无 React hooks。数据库客户端、缓存、第三方 SDK 等基础设施放在 `src/lib/`，是 api 专属，不进共享包。中间件（`src/middleware/`）只负责横切关注点（认证、日志、错误处理、CORS），不依赖 Domain。
