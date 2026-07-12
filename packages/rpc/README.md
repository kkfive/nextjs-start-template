# @kkfive/rpc

调 apps/api（Hono）的 **类型化 RPC 扩展通道**：基于 Hono RPC（`hc<AppType>`）的端到端类型安全调用工厂 + envelope 解包 + 跨 app 自有 API calls。

## 定位：双后端通道中的扩展通道

client 有两条后端通道，rpc 是其中面向 Hono 的扩展通道：

| 通道 | 入口 | 适用场景 |
|---|---|---|
| **常规请求（默认）** | client Route Handler（`src/app/api/**`） | 通用 BFF / 代理 / 简单后端逻辑；不依赖 Hono |
| **Hono RPC（扩展）** | 本包 `hc<AppType>` → `apps/api` | 需要 Hono 后端、端到端类型化 RPC 的场景 |

常规请求走 client Route Handler，**rpc 仅用于需要 Hono 后端的场景**（类型化 hc RPC）。SSE 等流式不经 hc（走 `@kkfive/http-client` 的 `.sse()`）。

## 作用
- **hc RPC 工厂**：`createRpcClient(http, baseUrl)` 接收 app 注入的 `HttpService` 实例，hc 的 fetch 走 `http.instance`，复用实例的 retry / hooks / 401 跳转 / 错误归一化等拦截器
- **envelope 解析**：`unwrapData` 解析 api 的 `HttpResponse` envelope，失败抛 `BusinessError`
- **共享 calls**：跨 app 复用的自有 API 纯调用函数，供 feature hooks / SSR / 组件复用；单一 app 的业务 calls 留在该 app 的 feature

## 红线
- 依赖 `@kkfive/contracts`(type) / `hono`；peer 依赖 `@kkfive/http-client`（`createRpcClient` 需要 `HttpService` 类型）
- **不含 react-query / React**：hooks 由各 app 自行组装，rpc 只提供纯调用函数
- type-only 引 `api` 的 `AppType`（Hono RPC 端到端类型链源头，不引入运行时依赖）
- hc 类型链依赖 apps/api 的 `AppType`（type-only）+ **api routes 必须链式声明**（`new Hono().get().post()`），否则 `typeof` 不含路由 Schema，hc 推导失败

## 消费方式
```ts
import { createRpcClient, fetchHitokoto } from '@kkfive/rpc'
import { httpClient } from '@/service/http-client'

// app 注入自己的 HttpService 实例（浏览器 / 服务端各自治）
const client = createRpcClient(httpClient, apiBaseUrl)
const data = await fetchHitokoto(client)
```

各 app 创建 hc client（注入 HttpService + baseUrl），传给业务 calls。baseUrl 指向 `apps/api` 地址（client 侧用 `NEXT_PUBLIC_API_URL` 注入，见 `apps/client/src/service/rpc-client.ts`）。演示见 `apps/client` 的 `/demo/rpc`。
