# Service Rule

`src/service/` 只创建 HTTP、RPC、SSE 运行时实例；业务 calls、hooks、模型、store 和组件归入 feature。

客户端与服务端实例必须物理隔离；消费者按实际 runtime 选择实例，不用运行时分支代替模块边界。只有 RPC 实例可 type-only 消费 `api.AppType`；SSE 不经 hc。

文件位置、basename、marker、业务导出与 AppType 限制由 FFG03/FFG06 机器校验。运行时变化仍需验证环境隔离、请求契约和错误传播。
