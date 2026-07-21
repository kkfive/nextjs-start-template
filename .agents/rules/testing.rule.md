# Testing Rule

测试应证明公共行为，而不是复制实现细节。

共享包和各 app `src/lib` 的公开函数需要覆盖正常路径、错误路径和边界条件。外部依赖通过注入、MSW 或轻量 mock 隔离，避免测试依赖真实网络和不稳定环境。

普通 workspace package 新增 `test:run` 时复用根目录提供的 Vitest runner，例如 `pnpm --workspace-root exec vitest run packages/<pkg>`。不要仅为运行测试而给 package 重复添加 `vitest` devDependency 或修改 lockfile；依赖治理或独立发布任务除外。

组件测试关注用户可观察行为：渲染状态、交互结果、无障碍语义和错误兜底。新增约定或修复漂移时，应优先补充可自动运行的校验，避免只靠文档提醒。
