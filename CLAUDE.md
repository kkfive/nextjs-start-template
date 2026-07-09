# CLAUDE.md

pnpm workspace + Turborepo monorepo（`apps/` / `packages/` / `internal/`）。所有回复使用简体中文。

规范源在 `.agents/`，本文件是 Claude Code 的路由薄壳。与 `.agents/rules/` 或 `.agents/skills/` 冲突时，以规范源为准。Codex / ZCode 用户读 `AGENTS.md`（内容一致）。

<!-- <always-applicable> 和 <task-routing> XML 标签是承重的：LLM 在上下文压缩后
     仍能识别标签包裹的硬约束区块。详见 skill-based-architecture thin-shells 规范。 -->

<always-applicable>

## Always Read

@.agents/rules/core.rule.md
@.agents/rules/monorepo.rule.md

## 先查后建（通用门禁）

接到任务后，按任务类型决定是否先检索已有实现：

- **新建类任务**（新建组件、新对接接口、新定义类型/schema、新封装 service/util）：**必须**先检索项目是否已有同类实现。发现已有 → 优先复用或改造；未发现 → 才新建并在对应导出入口登记。
- **改造/修复类任务**：**视情况**检索。但用户明确要求检索时，**必须**执行。
- 检索方法见 `.agents/skills/coding-standards/workflows/search-before-create.md`。

</always-applicable>

<task-routing>

## Load When Editing

- `apps/*/domain/**` → @.agents/rules/domain.rule.md
- `packages/**` → @.agents/rules/packages.rule.md
- `apps/*/src/components/**` → @.agents/rules/ui.rule.md
- `apps/client/src/app/**`、`apps/admin/src/app/**` → @.agents/rules/next-app.rule.md
- `apps/api/**` → @.agents/rules/hono.rule.md
- `**/*.test.*`、`**/__tests__/**` → @.agents/rules/testing.rule.md

Skill 的 `name` / `description` / `file path` 由工具自动注入会话上下文，无需在此手动维护索引。默认从 `project-architecture`（`primary: true`）开始匹配。

</task-routing>

## Auto-Triggers

- **新任务（同一会话）** → 重读本文件。"我之前读过"不成立。
- **非平凡任务完成前** → 运行 `pnpm run verify` + `pnpm test:run` + `pnpm run lint`。
