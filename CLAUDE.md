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

## Skill Index

所有项目 skill 位于 `.agents/skills/<name>/`。按需打开对应 `SKILL.md`，默认从 `project-architecture` 开始。

| Skill | 何时使用 |
|---|---|
| project-architecture | 决定新代码放哪一层、检查跨层 import、monorepo 分层 |
| coding-standards | 写组件代码、解决 import 报错、类型/错误/图标/测试规范 |
| domain-layer | 新建 Domain 适配层、写 Service/Controller/Hooks |
| nextjs-app-router | `apps/*/src/app/` 下新建页面/API/Server Action |
| hono-api | `apps/api` 新建 Hono 路由、schema 校验 |
| create-package | 新建共享包（目录/exports/tsconfig/peer deps） |
| create-app | 新建应用（workspace 注册、继承 internal 配置） |
| ant-design | antd 组件 / ConfigProvider / SSR / 高级 Form/Table |
| styling-system | 调样式（5 级优先级）、主题切换、暗色 |
| motion | Motion 动画（手势、滚动、布局、退出） |
| searches-iconify | Iconify 图标搜索 |
| smart-commit | 暂存区分组拆 commit |

</task-routing>

## Auto-Triggers

- **新任务（同一会话）** → 重读本文件 + 重新匹配 Skill Index 路由。"我之前读过"不成立。
- **非平凡任务完成前** → 运行 `pnpm run verify` + `pnpm test:run` + `pnpm run lint`。
