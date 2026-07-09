# Hono API Skill

`apps/api` Hono 后端服务规范 - 路由组织、schema 校验、同进程直调 domain-core、中间件链。

## 使用场景

- 新建 Hono 路由端点
- 编写中间件（认证/日志/CORS/错误处理）
- 用 `@kkfive/contracts` 校验请求
- 明确 BFF（Next.js apps）与真正后端（`apps/api`）的边界

## 调用方式

```
/hono-api
```

## 核心定位

`apps/api` 是真正的后端服务进程，承担鉴权、数据库持久化、业务编排。它：

- 同进程直调 `@kkfive/domain-core` 的 Controller，**不经过 HttpService**
- 用 `@kkfive/contracts` 的 schema 校验请求、格式化响应
- 路由层仅做 HTTP 协议适配，业务逻辑在 domain-core
- 数据库客户端、缓存、第三方 SDK 放 `src/lib/`，不进共享包

## 目录结构

```
apps/api/
├── domain/              # Domain 适配层（re-export @kkfive/domain-core，无 hooks、无注入）
├── src/
│   ├── routes/          # Hono 路由（HTTP 协议适配）
│   ├── middleware/      # 中间件（认证、日志、错误处理、CORS）
│   ├── lib/             # 服务端基础设施（DB、缓存、第三方 SDK）
│   └── app.ts           # Hono app 入口
└── package.json         # dev: tsx watch；build: tsup
```

## References

- `workflows/new-route.md` - 新建路由端点
- `workflows/add-middleware.md` - 新增中间件
- `references/schema-validation.md` - schema 校验
- `references/domain-direct-call.md` - 同进程直调 domain-core
- `references/gotchas.md` - 踩坑速查
