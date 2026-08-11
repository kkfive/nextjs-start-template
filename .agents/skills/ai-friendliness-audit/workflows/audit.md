# 审计流程

1. 冻结可复验基线；现有规则不是其自身保留依据。
2. 运行 `pnpm test:ai-friendliness`，保留各层真实状态。
3. 对每条规则判断：代码是否可推断、机器能否替代、缺失时是否改变正确决策。
4. 只保留无法从代码推断的稳定项目选择；其余 delete、automate 或 rewrite。
5. 修改 checker 时遵循 `evidence-first-development`；修改 prose 时比较实际 bytes 与任务闭包。
6. 报告未执行证据，不把静态通过当作 Agent 行为或独立验收。
