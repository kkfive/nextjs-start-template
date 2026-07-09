# Gotchas

## 路由 vs 业务边界

- **路由里写业务规则（if/循环/字段转换）** → 业务逻辑下沉到 `@kkfive/domain-core` Controller；路由只做 HTTP 适配
- **路由直接读写数据库 / 拼 SQL** → 数据访问在 Controller 或 `src/lib/` 基础设施
- **在 `apps/api` 注入 HttpService 调自己** → 同进程直调 Controller，避免多余 HTTP 跳转

## BFF vs 后端混淆

- **把核心业务写在 Next.js apps 的 `src/app/api/`（BFF）** → BFF 仅聚合/转发；核心后端逻辑在 `apps/api`
- **`apps/api` 返回的数据 Next.js app 直接信任不校验** → 用 `@kkfive/contracts` schema 校验，外部响应不可信

## 中间件

- **中间件 import Domain** → 中间件只做横切（认证/日志/CORS），不依赖业务
- **中间件顺序错误** → 日志 → CORS → 认证 → 路由；错误处理用 `app.onError`
- **每路由重复 try/catch** → 用统一 `app.onError` 处理

## schema 校验

- **路由内联定义 zod schema** → 从 `@kkfive/contracts` 导入，单一真源防漂移
- **不校验请求体直接用** → `c.req.json()` 后必须 `safeParse`
- **schema 只在 api 用就放进 contracts** → 出现第二个消费方再提取；只在 api 内部用就放 `apps/api/domain/`

## 同进程直调

- **`apps/api/domain/` 适配层加 hooks** → api 无 React，无 hooks；只 re-export 共享包
- **`apps/api/domain/` 注入 HttpService** → 同进程直调，不经 HTTP
