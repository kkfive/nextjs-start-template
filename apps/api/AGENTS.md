# apps/api 协作准则（Hono）

`apps/api` 是独立后端服务进程（Hono），承担鉴权、数据持久化和业务编排。独立部署、独立扩缩容；Next.js apps 的 `src/app/api/` 仅承担轻量 BFF。

继承根 `AGENTS.md` 全部规则，补充本包专属约束。与根级冲突时以根级硬性约束为准。

<always-applicable>

## 关键约束

### 路由层与业务编排

- `src/routes/` 仅负责解析请求、用 `@kkfive/contracts` schema 校验、调用本 app 业务模块并格式化响应
- 业务编排及其私有逻辑位于 `src/features/<feature>/`；路由不定义可复用视图、共享业务模块或跨路由状态
- `src/lib/` 仅放数据库客户端、缓存和第三方 SDK 等基础设施；中间件只做认证、日志、错误处理和 CORS 等横切关注点

### 依赖边界

| 层 | 可以导入 | 禁止导入 |
|---|---|---|
| `src/features/` | `@kkfive/contracts`、`@/lib/*`、外部服务端库 | `src/routes/*`、前端框架 API、`@kkfive/http-client` |
| `src/routes/` | `@/features/*`、`@kkfive/contracts`、`@/lib/*`、`@/middleware/*` | feature 内部私有文件（通过入口导入） |
| `src/middleware/` | `@/lib/*`、外部服务端库 | `@/features/*`、`src/routes/*` |

</always-applicable>

<task-routing>

## 构建与运行

- `dev`: `tsx watch src/app.ts`（走源码消费，无需预 build packages）
- `build`: `tsup`（打包整个 app，含 workspace 包源码）
- tsconfig 继承 `@kkfive/tsconfig/hono.json`（无 DOM lib）

Skill 的 meta 由工具自动注入。api 有包级专属 skill `hono-api`（`.agents/skills/hono-api/`）。

## 参考

- 根级规范：`../../AGENTS.md`

</task-routing>
