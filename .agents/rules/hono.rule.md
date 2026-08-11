# Hono Rule

route handler 负责协议适配和当前业务编排；复杂纯逻辑留在对应 route 目录，不预设额外业务层。`src/lib` 只放基础设施，middleware 只处理横切关注点。

输入复用共享 contract；响应、错误 envelope 与 SSE 帧保持前后端一致。前端业务通过 app 的 RPC service 实例访问。
