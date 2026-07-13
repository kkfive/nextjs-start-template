# @kkfive/rpc

供 app 组装 Hono RPC 客户端的共享基础能力：泛型 `hc` 工厂与 envelope 解包。

## 定位：双后端通道中的扩展通道

client 有两条后端通道，rpc 是其中面向 Hono 的扩展通道：

| 通道                 | 入口                                        | 适用场景                                    |
| -------------------- | ------------------------------------------- | ------------------------------------------- |
| **常规请求（默认）** | client Route Handler（`src/app/api/**`）    | 通用 BFF / 代理 / 简单后端逻辑；不依赖 Hono |
| **Hono RPC（扩展）** | app service 中的 `hc<AppType>` → `apps/api` | 需要 Hono 后端、端到端类型化 RPC 的场景     |

常规请求走 client Route Handler，**rpc 仅用于需要 Hono 后端的场景**（类型化 hc RPC）。SSE 等流式不经 hc（走 `@kkfive/http-client` 的 `.sse()`）。

## 作用

- **hc RPC 工厂**：`createRpcClient<AppType>(http, baseUrl)` 接收 app 注入的 `HttpService` 实例，hc 的 fetch 走 `http.instance`，复用实例的 retry / hooks / 401 跳转 / 错误归一化等拦截器
- **envelope 解析**：`unwrapData` 解析 api 的 `HttpResponse` envelope，失败抛 `BusinessError`

## 红线

- 依赖 `@kkfive/contracts` / `hono`；peer 依赖 `@kkfive/http-client`（`createRpcClient` 需要 `HttpService` 类型）
- 不依赖任何 app、React 或 react-query；路由类型与业务 calls 由消费 app 持有
- `AppType` 只在消费 app 的 service 中以 `import type` 引入；api routes 必须链式声明，否则 `typeof app` 不含完整路由 Schema

## 消费方式

```ts
import type { AppType } from 'api'
import { createRpcClient } from '@kkfive/rpc'
import { httpClient } from '@/service/http-client'

// app 注入自己的 HttpService 实例（浏览器 / 服务端各自治）
const client = createRpcClient<AppType>(httpClient, apiBaseUrl)
const response = await client.hitokoto.$get()
```

各 app 创建 hc client（注入 HttpService + baseUrl），并把业务 calls 放在自己的 feature 中。baseUrl 指向 `apps/api` 地址（client 侧用 `NEXT_PUBLIC_API_URL` 注入，见 `apps/client/src/service/rpc-client.ts`）。演示见 `apps/client` 的 `/demo/rpc`。
