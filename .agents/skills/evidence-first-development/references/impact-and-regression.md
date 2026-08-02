# Impact and Regression

## 影响调查

实现前至少检查：

- 被改动符号的调用方和公共导出；
- workspace manifest 与依赖图中的直接消费者；
- 运行时依赖（HTTP、RPC、环境变量、缓存、数据库、浏览器）；
- 现有测试、fixture、build 与 CI 路径；
- 需要保持不变的相邻行为。

Turbo affected 只能提示执行范围，不能证明测试覆盖了语义影响。

## 回归同心圆

1. **目标证据**：RED/GREEN 使用的同一命令或步骤。
2. **所属边界**：feature、app、package 或 repo-tooling 的聚焦测试。
3. **直接消费者**：公共 export、contract、RPC、HTTP client、UI 变化必须验证直接消费者。
4. **全局门禁**：非平凡修改运行 `pnpm verify` 与 `pnpm test:run`。
5. **运行时验收**：修改 app 或构建配置时构建相关 app；关键跨边界路径执行集成、API 或浏览器验收。

## 风险升级

以下任一情况不得停在局部测试：

- 公共 schema、类型、error envelope、状态码或 export 改变；
- 多个 app/package 消费同一能力；
- 权限、安全、持久化、缓存、并发或数据一致性；
- 运行时依赖不完全体现在 workspace graph；
- 局部测试大量 mock 掉目标调用链；
- 历史上已发生跨模块回归。

没有可运行测试的 workspace 不得用空脚本或 `passWithNoTests` 冒充覆盖；应补真实证据或明确残余风险。
