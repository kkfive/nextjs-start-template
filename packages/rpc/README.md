# @kkfive/rpc

类型化 RPC 包：基于 Hono RPC（`hc<AppType>`）的端到端类型安全调用工厂 + envelope 解包 + 自有 api 共享业务 calls。

## 作用
- **hc RPC 工厂**：`createRpcClient(http, baseUrl)` 接收 app 注入的 `HttpService` 实例，hc 的 fetch 走 `http.instance`，复用实例的 retry / hooks / 401 跳转 / 错误归一化等拦截器
- **envelope 解析**：`unwrapData` 解析 api 的 `HttpResponse` envelope，失败抛 `BusinessError`
- **业务 calls**：`fetchHitokoto` / `callScenario` / `callEnvelopeScenario` 等纯调用函数，供 app 的 hooks / SSR / 组件复用

## 红线
- 依赖 `@kkfive/contracts`(type) / `hono`；peer 依赖 `@kkfive/http-client`（`createRpcClient` 需要 `HttpService` 类型）
- **不含 react-query / React**：hooks 由各 app 自行组装，rpc 只提供纯调用函数
- type-only 引 `api` 的 `AppType`（Hono RPC 端到端类型链源头，不引入运行时依赖）
- hc 类型链依赖 apps/api 的 `AppType`（type-only）+ **api routes 必须链式声明**（`new Hono().get().post()`），否则 `typeof` 不含路由 Schema，hc 推导失败

## 消费方式
```ts
import { createRpcClient, fetchHitokoto } from '@kkfive/rpc'
import { httpClient } from '@/service/index.client'

// app 注入自己的 HttpService 实例（浏览器 / 服务端各自治）
const client = createRpcClient(httpClient, apiBaseUrl)
const data = await fetchHitokoto(client)
```

各 app 创建 hc client（注入 HttpService + baseUrl），传给业务 calls。SSE 等流式不经 hc（走 `@kkfive/http-client` 的 `.sse()`）。
