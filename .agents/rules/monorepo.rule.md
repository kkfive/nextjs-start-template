# Monorepo Rule

`apps` 独立部署，`packages` 提供共享能力，`internal` 提供工具链。依赖方向与 Hono AppType 例外由 FFG05/FFG06 校验，不在文档复制 pattern。

package 只承载已有跨 app 复用且框架边界清晰的能力；业务实现留在所属 app。workspace 走源码消费，内部依赖使用 `workspace:*`；具体 manifest 与 task 一致性由 workspace validator、pnpm 和 Syncpack 负责。

Turbo、CI、workspace 与机器治理变化先用 fixture 或隔离仓库证明失败，再执行真实命令。全局一致性检查保持全量，affected 只优化适合增量执行的耗时任务。
