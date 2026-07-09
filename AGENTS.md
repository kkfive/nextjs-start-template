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
- `apps/client/src/app/**`、`apps/admin/src/app/**` → @.agents/rules/next-app.rule.md
- `apps/api/**` → @.agents/rules/hono.rule.md
- `**/*.test.*`、`**/__tests__/**` → @.agents/rules/testing.rule.md

规则文件简短只表达稳定原则；具体流程、示例、踩坑见下方 Skill Index。

## Skill Index

所有项目 skill 位于 `.agents/skills/<name>/`，这是跨 agent 的唯一规范目录。各 agent 通过本索引按需打开对应 `SKILL.md`。

| Skill | 入口 | 何时使用 |
|---|---|---|
| project-architecture | `.agents/skills/project-architecture/SKILL.md` | 决定新代码放哪一层、检查跨层 import、monorepo 分层 |
| coding-standards | `.agents/skills/coding-standards/SKILL.md` | 写组件代码、解决 import 报错、类型/错误/图标/测试规范 |
| domain-layer | `.agents/skills/domain-layer/SKILL.md` | 新建 Domain 适配层、写 Service/Controller/Hooks、与 `@kkfive/domain-core` 关系 |
| nextjs-app-router | `.agents/skills/nextjs-app-router/SKILL.md` | `apps/*/src/app/` 下新建页面/API/Server Action、缓存与 Metadata |
| hono-api | `.agents/skills/hono-api/SKILL.md` | `apps/api` 新建 Hono 路由、schema 校验、同进程直调 domain-core |
| create-package | `.agents/skills/create-package/SKILL.md` | 新建共享包（目录/exports/tsconfig/peer deps） |
| create-app | `.agents/skills/create-app/SKILL.md` | 新建应用（workspace 注册、继承 internal 配置） |
| ant-design | `.agents/skills/ant-design/SKILL.md` | antd 组件 / ConfigProvider / SSR / 高级 Form/Table |
| styling-system | `.agents/skills/styling-system/SKILL.md` | 调样式（5 级优先级）、主题切换、暗色 |
| motion | `.agents/skills/motion/SKILL.md` | Motion 动画（手势、滚动、布局、退出） |
| searches-iconify | `.agents/skills/searches-iconify/SKILL.md` | Iconify 图标搜索 |
| smart-commit | `.agents/skills/smart-commit/SKILL.md` | 暂存区分组拆 commit |
| _template | `.agents/skills/_template/` | 新建 skill 的起点 |

每个 skill 内部结构：`SKILL.md`（入口 ≤ 90 行）+ `routing.yaml`（任务路由）+ `rules/` + `workflows/` + `references/`（含 `gotchas.md`）。

</task-routing>

## Auto-Triggers

- **新任务（同一会话）** → 重读本文件 + 重新匹配 Skill Index 路由 + 按需重读 required rules。"我之前读过"不成立——上下文会压缩，路由可能变化。
- **非平凡任务完成前** → 运行 Machine Guards 校验。仅格式化、注释、依赖版本号、保持行为的重构可跳过。

## Machine Guards

- `pnpm run verify`
- `pnpm test:run`
- `pnpm run lint`

Git hook 在 `lefthook.yml` 接入 commit message 与 pre-commit 校验。多人协作时只暂存和提交当前任务直接产生的文件。

## 参考

- 规范治理原则：`docs/decisions/rule-governance.md`
- Skill 模板与 16 条原则：`.agents/skills/_template/`
