# AI 治理多 Agent 交叉审计证据

日期：2026-07-30。审计对象：根/scoped `AGENTS.md`、`.agents/rules/`、`.agents/skills/`、静态审计、governance E2E 与 CI/workflow。仓库原有治理文本仅是被审计对象，不作为自身保留依据。

## Agent A：必要性与机器替代

- **事实**：根入口只保留路径/意图路由、scoped entry、事实源与证据边界（`AGENTS.md:5-37`）。
- **机器 owner**：代码形状和目录依赖交由 ESLint、TypeScript、FFG01–FFG08；workspace/task/manifest 一致性交由 workspace validator、pnpm、Syncpack（`.agents/rules/{core,monorepo,next-app,service,hono}.rule.md`）。
- **保留理由**：Server/Client runtime、缓存闭环、错误传播、公共契约、用户可观察行为与独立验收不能由 AST/类型门禁完整证明，仍由 owner rule/Skill 表达。
- **决策**：删除 pattern 枚举和易腐 package 清单；保留语义边界、风险和唯一 owner 导航。

## Agent B：实际触发与遵守

- **静态可证**：根 route table、Skill frontmatter、profile 的 expected entries/rules/skills、allowed paths、gates。
- **有限运行证据**：`trace.ts` 仅把成功的 `cat/head/less/nl/sed/tail` 命令作为内容读取候选，并报告 `content_read_shell_commands_only` 与 `model_attention_not_observable`；不把路径枚举冒充阅读理解。
- **真实运行**：在 clean `/tmp/kkfive-ai-governance-real2` snapshot 上成功 prepare 并执行 next-page、package-test、monorepo-config、bug-fix 四个不含治理提示的 Codex write profile；四个 delegate exit 0。修正 trace、RED replay 与 worktree 依赖环境后再次 collect：四 profile 均为 `acceptance_pending`，RED replay 全通过、所有 gates 通过，`validate-technical` 返回 `valid: true`；没有把技术通过冒充独立验收通过。
- **边界**：真实运行能证明 harness、路由读取候选与拒绝逻辑工作；不能证明模型注意力。独立 browser/API/reviewer acceptance 尚未完成。

## Agent C：重复与表述效率

- **完全重复**：AIFA002 当前无 finding；其结论只覆盖规范化后逐行完全重复，不宣称覆盖近义语义。
- **近义重复**：feature/ui/packages 对组件归属、根/testing/evidence Skill 对证据导航存在必要的跨层导航重叠；已指定 feature 负责业务归属、ui 负责 UI 目录、package/scoped entry 负责局部增量、evidence Skill 负责完整流程。
- **量化**：同一冻结路径集合复算：入口 estimated tokens 3,407→1,164（-65.8%）；6 个既有 Skill 232→116 行（-50.0%）；70 个同基线路径 estimated tokens 32,405→26,570（-18.0%）。原始逐文件基线位于 `/tmp/ai-friendly-baseline/governance-sizes.tsv`；下方给出可复算算法。
- **决策**：保留必要 route/owner 指向，不为消除表面重复而删除导航；低价值通用 owner 模板已压缩。

## Agent D：workflow 自动化与安全

- **静态层**：`pnpm audit:ai-friendliness` 输出固定 schema `ai-friendliness-audit/1`、check ID、severity、`path:line`、JSON/Markdown；普通 CI 无模型依赖。
- **真实层**：每周/手工 workflow 执行 unhinted profiles、collect、technical validation、cleanup、完整 artifact/raw JSONL 上传；endpoint secret 仅暴露给配置步骤。
- **失败语义**：区分 `failed`、`infrastructure_error`、`acceptance_pending`、`passed`；technical validation 不放宽预算、读取覆盖、禁读类别、diff、RED 或 gates；严格 validation 重读 acceptance evidence。
- **残余限制**：周期 workflow 自动阶段停在 `acceptance_pending`，明确要求外部验收；GitHub Actions 尚无平台实际运行记录。四 profile 技术阶段已全绿，不据此声称 browser/API/reviewer strict acceptance 已完成。

## 机器化决策矩阵

| 类别 | 决策 | owner / 证据 |
|---|---|---|
| orphan route、stale Markdown | automate | AIFA001/AIFA004（error） |
| 完全重复、文档预算 | automate + review | AIFA002/AIFA003（warning） |
| import/类型/目录/依赖 pattern | delete from prose | ESLint、TypeScript、FFG |
| workspace/task/manifest | delete from prose | workspace validator、pnpm、Syncpack |
| runtime、错误传播、缓存、行为 | keep/rewrite | owner rules + evidence Skill |
| 模型实际触发/阅读 | periodic real run | governance E2E；注意力不可观测 |
| browser/API/reviewer 结果 | external acceptance | `accept` + strict `validate` |

## 可复现证据

```bash
pnpm test:ai-friendliness
pnpm audit:ai-friendliness --format json
pnpm verify:architecture
pnpm test:repo
pnpm verify
pnpm test:run
```

最终观察：聚焦 24 tests、repo 92 tests、architecture、`pnpm verify`、`pnpm test:run` 均通过；静态审计 73 文档、0 findings。

量化算法：对冻结 TSV 的同一路径集合分别读取基线与当前 bytes/lines；estimated tokens 为 `ceil(bytes / 4)`。入口集合为根及 scoped `AGENTS.md`；Skill 集合为原有六个 `SKILL.md`。该算法与 `scripts/repo-tooling/ai-friendliness-audit/static-audit.ts` 的 bytes/4 估算一致。
