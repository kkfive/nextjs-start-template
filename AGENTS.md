# 项目协作准则

pnpm workspace + Turborepo monorepo（`apps/` 独立应用 / `packages/` 共享包 / `internal/` 工具链配置），每个 Next.js app 内部采用 Domain 适配层 / 应用基础设施 / UI / 路由分层。所有回复使用简体中文。

规范源在 `.agents/`，本文件是 Claude Code（通过 `CLAUDE.md`）、Codex CLI、ZCode 三工具共用的路由薄壳。当本文件与 `.agents/rules/` 或 `.agents/skills/` 冲突时，以规范源为准。

<!-- <always-applicable> 和 <task-routing> XML 标签是承重的：LLM 在上下文压缩后
     仍能识别标签包裹的硬约束区块。详见 skill-based-architecture thin-shells 规范。 -->

<always-applicable>

## Always Load

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
- `apps/*/src/app/**` → @.agents/rules/next-app.rule.md
- `apps/api/**` → @.agents/rules/hono.rule.md
- `**/*.test.*`、`**/__tests__/**` → @.agents/rules/testing.rule.md

规则文件简短只表达稳定原则；具体流程、示例、踩坑在对应 skill 的 `SKILL.md` + `routing.yaml` 中。

Skill 的 `name` / `description` / `file path` 由各工具（ZCode / Codex / Claude Code）自动注入会话上下文，无需在此手动维护索引。单包专属 skill 放 `<包>/.agents/skills/`，多包共享 skill 放根 `.agents/skills/`。新建/上升/下沉 skill 见 `.agents/skills/_template/SKILL.md`。

</task-routing>

## Auto-Triggers

- **新任务（同一会话）** → 重读本文件 + 按需重读 required rules。"我之前读过"不成立——上下文会压缩，路由可能变化。
- **非平凡任务完成前** → 运行 Machine Guards 校验。仅格式化、注释、依赖版本号、保持行为的重构可跳过。

## Machine Guards

- `pnpm run verify`
- `pnpm test:run`
- `pnpm run lint`

Git hook 在 `lefthook.yml` 接入 commit message 与 pre-commit 校验。多人协作时只暂存和提交当前任务直接产生的文件。

## 参考

- Skill 模板与原则：`.agents/skills/_template/`
