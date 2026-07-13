# @kkfive/contracts

API 契约包：zod-first schema + 共享类型 + http/error 契约。全栈唯一的类型源头。

## 作用

- **zod schema**：定义请求/响应数据形状。api 用 `zValidator` 校验入参，前端用 `infer` 推导类型。
- **共享类型**：业务模型类型（基于 schema infer）。
- **错误契约**：`HttpResponse` / `HttpResponseSuccess` / `HttpResponseError` envelope 类型 + 业务错误码（`src/errors/code.ts`）。

## 红线

- **框架无关、零运行时依赖**（仅 zod）：可被 Node / 浏览器 / Edge 任意环境消费。
- 不含任何业务逻辑、HTTP 客户端实例、React。
- 不重复实现后端字段——只做契约，不做实现。

## 消费方式

```ts
// 子路径
```

api 路由用 schema 校验入参，前端用类型推导。是 Hono RPC 端到端类型链的源头（配合 `apps/api` 的 `AppType`）。
