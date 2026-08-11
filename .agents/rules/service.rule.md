# Service Rule

`src/service/` 只保存 HTTP、RPC、SSE 运行时实例；业务调用留在 feature。客户端与服务端实例物理隔离；SSE 不使用 Hono `hc`。
