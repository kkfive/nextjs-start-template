# AI 文档分类决策

## 背景

`docs/` 中既有面向人类的架构说明，也有面向 agent 的约束、流程和外部参考。为避免 agent 必读上下文膨胀，项目不再把 `docs/` 作为规则入口，而是将可执行约束和任务流程沉淀到 `.agents/`。

## 决策

- `.agents/rules/` 存放必须遵守、可验证的稳定规则。
- `.agents/skills/` 存放按任务触发的流程、规则和参考资料。
- `docs/` 保留背景、ADR、方案说明、集成说明和长示例，不作为 agent 必读规则源。
- 外部参考索引迁入对应 skill 的 `references/`，例如 Ant Design 资料位于 `.agents/skills/ant-design/references/antd.md`。

## 当前分类

| 文档 | 分类 | 处理 |
|---|---|---|
| `docs/architecture.md` | 背景 + 规则来源 | 暂保留；稳定约束由 `.agents/rules/` 和 architecture skill 承接 |
| `docs/conventions/directory.md` | 背景 + 规则来源 | 暂保留；可检查枚举由 `scripts/verify-conventions.mjs` 承接 |
| `docs/conventions/naming.md` | 背景 + 规则来源 | 暂保留；后续可拆入 coding-standards references |
| `docs/ai-code-convention-guard.md` | 治理方案 | 暂保留；可执行步骤后续拆入 coding-standards workflow |
| `docs/decisions/rule-governance.md` | ADR | 保留并指向 `.agents/` |
| `docs/faq.md` | FAQ / gotchas 来源 | 暂保留；高频踩坑后续拆入对应 skill references |
| `docs/pdf-viewer-integration.md` | 功能集成说明 | 保留，除非 PDF 维护形成独立 skill |

## 后果

新增或维护 AI 约束时，先判断内容是 rule、workflow、reference 还是 ADR。只有可执行约束和任务流程进入 `.agents/`；解释性长文仍留在 `docs/`，并通过 source link 被 skill 引用。
