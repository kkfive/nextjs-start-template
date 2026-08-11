# Evidence Matrix

选择能覆盖真实风险的最低有效层级，而不是默认单元测试。

| 变更边界 | 首选证据 | 必要升级 |
|---|---|---|
| 纯函数、schema、状态转换 | 单元测试 | 公共导出变更时验证消费者 |
| React feature / 交互 | Testing Library 组件交互，断言用户可观察状态与语义 | 关键用户路径、路由或浏览器差异升级 browser/E2E |
| HTTP / RPC / Route Handler / Hono | 契约或集成测试，覆盖 schema、状态码、envelope 与错误传播 | 两端共同变化时执行真实边界调用 |
| App Router 缓存、Server Action、Server/Client 边界 | 对应 runtime 集成证据 | 缓存失效和导航行为升级浏览器验收 |
| `contracts` / `rpc` / `http-client` / `ui` | package 行为证据 + 直接消费者回归 | 破坏性或跨 app 变化升级全仓/端到端 |
| CI / Turbo / workspace / policy | fixture、临时仓库、真实命令 | 保持 CI 全量/affected 语义的独立断言 |
| 权限、安全、数据一致性、并发 | 负向测试、集成测试与不变量 | 高风险时安全审查、真实存储或并发测试 |
| 视觉、响应式、无障碍 | 浏览器交互、语义断言、截图/审计 | 多 viewport、键盘操作与独立视觉审查 |
| 性能 | 可重复 benchmark | 真实负载或性能预算回归 |

## 质量判断

- 证据断言公共行为或外部契约，不主要断言私有函数、内部 state 或 mock 调用次数。
- mock 只隔离最外层不稳定 IO；HTTP 优先 MSW，关键跨边界路径不能全部 mock 掉。
- coverage 只作诊断信号，不作为需求正确或测试有效的替代品。
