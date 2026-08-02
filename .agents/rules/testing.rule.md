# Testing Rule

测试证明公共行为，不复制实现细节。组件关注可观察状态、交互和可访问语义；跨 HTTP/RPC 边界优先契约、MSW 或集成证据。

测试应覆盖与风险相称的正常路径、错误路径、边界条件和关键不变量。mock 用于隔离不稳定外部依赖，不以调用次数代替结果。

需求分析、RED/GREEN、回归升级与独立验收由 `evidence-first-development` 统一编排；本规则只负责测试证据质量。测试依赖与 runner 一致性由 workspace validator 和现有门禁负责。
