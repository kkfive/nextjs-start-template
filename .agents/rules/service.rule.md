# Service Rule

`src/service/` 仅保存运行时实例：HTTP、RPC 与 SSE，以及用于隔离浏览器和服务端边界的 `client-only` / `server-only` 标记。实例文件以明确的 `http-client.ts`、`http-server.ts`、`rpc-client.ts`、`rpc-server.ts` 与可选 `sse-client.ts` 命名。

业务 calls、React Query hooks、页面模型、store、业务组件和 feature 纯逻辑都属于 `src/features/<feature>/`，不得放入 `src/service/` 或按业务名建立 service 子目录。

浏览器实例必须由 `client-only` 物理隔离，服务端实例必须由 `server-only` 物理隔离。只有 `rpc-*.ts`（含同目录测试）可 type-only 导入 `api.AppType`，并通过 `createRpcClient<AppType>(http, baseUrl)` 复用 app 注入的 HTTP 实例；SSE 不经 hc。
