# @kkfive/http-client

HTTP 抽象包：HttpService 接口/基础类 + 错误归一化 + SSE 工具。只定义抽象，不含具体运行环境实现。

## 作用
- **`HttpService`**：统一 HTTP 接口（`request` / `get` / `post` / ...），底层基于 `@kkfive/request`（ky）。
- **interceptor 机制**：`beforeRequest` / `afterResponse` hooks——承载请求日志、重试、401 跳转、`BusinessError` 归一化、服务端 cookie/token 注入。
- **错误归一化**：`BusinessError` + `createErrorResponse`（HTTP status → 业务友好错误）。
- **SSE**：透传 `@kkfive/request` 的 `SSEConfig` / `SSEEvent`（hc 不支持流式，SSE 走此独立通道）。

## 红线
- **底层 fetch，不绑业务**：不含任何业务逻辑、领域模型。
- 不含具体实例：实例由各 app 创建并注入（client 浏览器实例 / admin 服务端实例）。
- `apps/api`（Hono 后端）不使用此包——后端用 Hono 自身处理请求；此包服务前端的 HTTP 调用。

## 消费方式
```ts
import { HttpService, BusinessError, createErrorResponse } from '@kkfive/http-client'
```

各 app 创建 `HttpService` 实例后，由 `@kkfive/rpc` 的 `createRpcClient(http, baseUrl)` 注入 hc 客户端（hc 的 fetch 走 `http.instance`，复用实例的拦截器链）——类型安全由 `hc<AppType>` 提供，interceptor 由 HttpService 提供。
