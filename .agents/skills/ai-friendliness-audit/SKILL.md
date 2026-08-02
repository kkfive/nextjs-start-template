---
name: ai-friendliness-audit
description: 审计或精简 AI 提示词、AGENTS、rules、skills、触发可靠性、重复内容、陈旧事实与上下文成本；也用于周期治理检查。
user-invocable: true
---

# AI Friendliness Audit

执行审计时读取：

- 流程：`workflows/audit.md`
- keep/delete/automate 判定：`references/decision-matrix.md`
- 最近一次多 Agent 交叉审计、量化算法与真实运行边界：`references/audit-evidence.md`

阈值、检查算法和报告 schema 以 `scripts/repo-tooling/ai-friendliness-audit/` 为唯一事实源。本 Skill 不复制它们。
