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
- **包级 AGENTS.md 不枚举 rule 文件**：rule 的加载由根 AGENTS.md 的 Load When Editing 表按 glob 路由统一管理（如 `apps/*/domain/**` → domain.rule.md）。包级 AGENTS.md 只写该包特有的硬约束，不重复列 `@.agents/rules/xxx.rule.md`。新增 rule 文件只需在根表加一行 glob 映射，不改任何包级 AGENTS.md
- **先查后建**：新建类任务前必须先检索已有实现（见 `coding-standards/workflows/search-before-create.md`）。新增 skill 或包时同样适用
- **新增包规则判定**：新建 package/app 后，判断是否有"不同于根级通用规则的专属约束"。有 → 生成包级 AGENTS.md（thin-shell 格式）；无 → 不生成（progressive rigor）
- **禁止枚举式描述**：规范中不要枚举具体的包名/app 名/组件名/规则名清单（如"contracts 零依赖、domain-core 禁 React、http-client 禁…"）。这种枚举导致每新增一个同类项就要改两处（规范 + 实际），必然漂移。正确做法：①描述通用原则（"packages 保持通用，框架无关"）②指向目录（"各 package 的约束见对应包级 AGENTS.md"）③只在特定场景的特定规则中提及具体名（如 hono.rule.md 描述 apps/api 定位）。举例说明概念（"如 Button、Input 等基础组件"）不算枚举
- **skill 放置位置**：
  - **单包专属 skill**（仅服务一个包，如 hono-api 仅 apps/api 用）→ 放 `<包>/.agents/skills/<name>/`（ZCode/Codex 子包向上扫描自动发现；Claude Code 靠子包 AGENTS.md 路径引用）
  - **多包共享 skill**（服务 2+ 包，如 nextjs-app-router 服务 client+admin）→ 放根 `.agents/skills/`
  - description 必须写明作用域（如"仅在 apps/api 包内使用"），便于 AI 按需匹配不误触发
- **技术栈重叠的包（如 client 与 admin 都是 Next.js）**：
  - 共享 skill 不复制，留根单一源
  - **不要在 AGENTS.md 手动维护 skill 索引表**——各工具（ZCode / Codex / Claude Code）自动注入 skill 的 `name` / `description` / `file path` 到会话上下文，手动写是冗余且易不一致
  - skill 的 description 写清触发条件和作用域（如"仅在 apps/api 包内使用"），让 AI 按 description 自动匹配，不靠提示词列表
  - 包级 AGENTS.md 只需一句话提及该包有专属 skill（如"client 有包级 skill ant-design"），不列完整表
- **skill 上升（单包专属 → 多包共享）**：
  - 触发条件：第二个包开始使用同一 skill（如 admin 也接入 antd）
  - 步骤：①`git mv <包>/.agents/skills/<name> .agents/skills/<name>` 移到根 ②SKILL.md 的 description 移除"仅在 xxx 包内使用"的作用域限定 ③原包 AGENTS.md 把该 skill 从"包级专属"移到"根级共享"组 ④新包 AGENTS.md 的"根级共享"组加上该 skill ⑤根 AGENTS.md/CLAUDE.md Skill Index 表加回该 skill 行 ⑥跑 `pnpm run verify` 确认 G05 扫描到新位置
