---
name: skill-name
description: 一句话描述 - 覆盖的主题 + 触发场景。例如 "Domain 层架构规范 - HttpService 注入、Service/Controller/Hooks 分层。用于新建模块、解决跨层 import 问题。" 描述要包含真实触发短语（不超过 25 行）。
primary: false
user-invocable: true
---

# Skill 名称

## Scope
- Target: 目标技术栈或领域（如 "React 19 组件"、"Domain 层"）
- Cover: 覆盖的主题与模式
- Avoid: 不覆盖的内容（避免与其他 skill 边界混淆）

**边界声明**（若与其他 skill 主题相邻）：
- 文件级写法 → `/coding-standards`
- 架构决策 → `/project-architecture`
- ...

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 任务 A | `workflows/task-a.md` |
| 任务 B | `rules/rule-b.md` |
| 任务 C 的深度参考 | `references/topic-c.md` |
| 踩坑速查 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 反模式 1 | 正确做法 |

## Session Discipline

每次进入相关任务时**重新阅读**：路由可能调整。

## 相关 Skills

- `/related-skill-1`：互补主题
- `/related-skill-2`：边界声明

---

## 模板使用指引（创建新 skill 时阅读）

### 必须包含

- `SKILL.md`：≤ 90 行 body + ≤ 25 行 description
- `routing.yaml`：任务路由的单一源（被 SKILL.md 引用），每个 task 含 `trigger_examples`（用户实际会说的完整句子）
- `references/gotchas.md`：高价值踩坑

### 按需创建

- `rules/`：长期不变的硬约束（"什么是真的"）
- `workflows/`：步骤化流程（"怎么做"）
- `references/`：深度查询资料（按需打开）

### 单文件行数指引

- SKILL.md body ≤ 90 行（硬约束）
- description ≤ 25 行
- rules / workflows / references 单文件 ≤ 250 行（超出考虑拆分）

### 双适配（Claude Code + Codex）

- 保留 `name` + `description` + `user-invocable` frontmatter（Claude Code 自动发现）
- 在 `AGENTS.md` 的 Skill Index 段添加本 skill 的入口路径（Codex 用户索引）
- 内部用相对路径引用 `rules/` `workflows/` `references/`（两个工具都能跟链）

### 反模式（创建时避免）

- 把规则与流程混在 SKILL.md（应分到 `rules/` 与 `workflows/`）
- SKILL.md 超 90 行（应拆到 references）
- description 太宽泛或没有触发短语
- 缺 `routing.yaml`
- 缺 `references/gotchas.md`
- `routing.yaml` 的 task 缺 `trigger_examples`（G05 校验会报错）

### 规范对齐要点（skill-based-architecture）

- **`primary: true`**：仅 project-architecture 标记，作为默认 fallback skill。其他 skill 不标（G06 校验）
- **thin-shell 格式**：根 AGENTS.md / CLAUDE.md 及包级 AGENTS.md 必须含 `<always-applicable>` + `<task-routing>` XML 标签（抗上下文压缩，G01/G02 校验）
- **先查后建**：新建类任务前必须先检索已有实现（见 `coding-standards/workflows/search-before-create.md`）。新增 skill 或包时同样适用
- **新增包规则判定**：新建 package/app 后，判断是否有"不同于根级通用规则的专属约束"。有 → 生成包级 AGENTS.md（thin-shell 格式）；无 → 不生成（progressive rigor）
- **skill 放置位置**：
  - **单包专属 skill**（仅服务一个包，如 hono-api 仅 apps/api 用）→ 放 `<包>/.agents/skills/<name>/`（ZCode/Codex 子包向上扫描自动发现；Claude Code 靠子包 AGENTS.md 路径引用）
  - **多包共享 skill**（服务 2+ 包，如 nextjs-app-router 服务 client+admin）→ 放根 `.agents/skills/`
  - description 必须写明作用域（如"仅在 apps/api 包内使用"），便于 AI 按需匹配不误触发
