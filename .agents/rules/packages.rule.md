# Packages Rule

package 通过 `exports` 暴露稳定源码入口，由消费者编译。依赖必须完整且最小；运行时框架通常使用 peerDependencies，内部依赖使用 `workspace:*`。

新增 package 需具备 manifest、源码 export、统一 tsconfig、README 和根 TypeScript reference。测试 runner 复用根工具链；不得以空 runner、skip 或 `passWithNoTests` 冒充覆盖。

公共 export、schema、error envelope、RPC/HTTP 或基础 UI 契约变化必须识别并回归直接消费者。具体 workspace/task 完整性由 validator 校验；包的领域红线由其 scoped `AGENTS.md` 或代码事实负责，不在此维护易腐包清单。
