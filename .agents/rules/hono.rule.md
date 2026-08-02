# Hono Rule

`apps/api` 是独立后端；route handler 负责协议适配与当前业务编排，复杂纯逻辑可在对应 route 目录拆分。`src/lib` 存放服务端基础设施，middleware 只处理横切关注点。

输入使用共享 contract 校验，响应和错误保持统一 envelope；SSE 帧格式必须与客户端解析一致。前端通过 app service 中的 RPC 实例访问，`packages/rpc` 不绑定业务或 app 类型。

前端框架依赖限制由 ESLint/FFG07 校验。行为变化仍需覆盖 schema、状态码、错误传播和关键副作用；契约共同变化时验证真实边界。
